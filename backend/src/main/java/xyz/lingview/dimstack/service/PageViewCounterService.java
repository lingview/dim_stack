package xyz.lingview.dimstack.service;

public interface PageViewCounterService {

    void initializePageView(String alias, Long dbPageViews);

    void incrementPageView(String alias);

    Long getPageView(String alias);

    void removePageView(String alias);
}