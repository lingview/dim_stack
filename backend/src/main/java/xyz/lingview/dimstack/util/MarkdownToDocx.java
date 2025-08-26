package xyz.lingview.dimstack.util;

import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Node;
import com.vladsch.flexmark.util.data.MutableDataSet;
import org.apache.poi.xwpf.usermodel.*;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STShd;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Component
public class MarkdownToDocx {

    public byte[] convertMarkdownToDocx(String markdown) throws IOException {
        MutableDataSet options = new MutableDataSet();
        Parser parser = Parser.builder(options).build();
        Node document = parser.parse(markdown);
        String html = HtmlRenderer.builder(options).build().render(document);

        XWPFDocument doc = new XWPFDocument();
        org.jsoup.nodes.Document htmlDoc = Jsoup.parse(html);

        for (Element el : htmlDoc.body().children()) {
            String tag = el.tagName().toLowerCase();

            switch (tag) {
                case "h1", "h2", "h3", "h4", "h5", "h6":
                    XWPFParagraph headingPara = doc.createParagraph();
                    XWPFRun headingRun = headingPara.createRun();
                    headingRun.setBold(true);
                    int fontSize = 24 - (tag.charAt(1) - '0') * 2;
                    headingRun.setFontSize(fontSize > 8 ? fontSize : 10);
                    headingRun.setText(el.text());
                    break;

                case "p", "div":
                    XWPFParagraph para = doc.createParagraph();
                    XWPFRun pRun = para.createRun();
                    pRun.setText(el.text());
                    break;

                case "pre":
                    String htmlContent = el.html();

                    String rawText = htmlContent.replaceAll("<br[^>]*>", "\n")
                            .replaceAll("&nbsp;", " ")
                            .replaceAll("</?[^>]+>", "")
                            .trim();

                    String[] lines = rawText.split("\\r?\\n");

                    for (String line : lines) {
                        XWPFParagraph codePara = doc.createParagraph();
                        XWPFRun codeRun = codePara.createRun();
                        codeRun.setFontFamily("Courier New");
                        codeRun.setFontSize(10);
                        codeRun.setText(line);
                        codePara.getCTP().addNewPPr().addNewShd().setVal(STShd.CLEAR);
                        codePara.getCTP().getPPr().getShd().setColor("auto");
                        codePara.getCTP().getPPr().getShd().setFill("DDDDDD");

                        codePara.setIndentationLeft(200);
                    }
                    break;


                case "ul":
                    for (Element li : el.getElementsByTag("li")) {
                        XWPFParagraph listItem = doc.createParagraph();
                        XWPFRun listRun = listItem.createRun();
                        listItem.setIndentationLeft(400);
                        listRun.setText("• " + li.text());
                    }
                    break;

                case "ol":
                    int index = 1;
                    for (Element li : el.getElementsByTag("li")) {
                        XWPFParagraph listItem = doc.createParagraph();
                        XWPFRun listRun = listItem.createRun();
                        listItem.setIndentationLeft(400);
                        listRun.setText(index++ + ". " + li.text());
                    }
                    break;

                case "table":
                    processTable(el, doc);
                    break;

                default:
                    XWPFParagraph defaultPara = doc.createParagraph();
                    XWPFRun defaultRun = defaultPara.createRun();
                    defaultRun.setText(el.text());
                    break;
            }
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        doc.write(out);
        return out.toByteArray();
    }

    private void processTable(Element tableEl, XWPFDocument doc) {
        List<Element> rows = tableEl.getElementsByTag("tr");
        if (rows.isEmpty()) return;

        XWPFTable table = doc.createTable();

        for (Element rowEl : rows) {
            XWPFTableRow newRow = table.createRow();
            List<Element> cells = rowEl.getElementsByTag("td");

            if (cells.isEmpty()) {
                cells = rowEl.getElementsByTag("th");
            }

            if (table.getRows().size() == 1 && table.getRow(0).getTableCells().isEmpty()) {
                table.removeRow(0);
            }

            for (Element cellEl : cells) {
                XWPFTableCell cell = newRow.createCell();
                cell.setText(cellEl.text());
            }
        }
    }

}
