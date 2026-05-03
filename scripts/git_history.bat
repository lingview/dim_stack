git config --global i18n.logoutputencoding gbk
git log --pretty=format:"%h %an %ad %s" > commits.txt
git config --global --unset i18n.logoutputencoding