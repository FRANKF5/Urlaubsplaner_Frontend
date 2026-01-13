package com.urlaubsplaner.uniprojekt.templates;

import java.sql.Date;

public class Activity {
    private long id;
    private String geolocation;
    private Date startDate;
    private Date endDate;
    private String title;
    private String description;

    public Activity() {}

    public Activity(long id, String geolocation, Date startDate, Date endDate, String title, String description) {
        this.id = id;
        this.geolocation = geolocation;
        this.startDate = startDate;
        this.endDate = endDate;
        this.title = title;
        this.description = description;
    }

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }
    public String getGeolocation() {
        return geolocation;
    }
    public void setGeolocation(String geolocation) {
        this.geolocation = geolocation;
    }
    public Date getStartDate() {
        return startDate;
    }
    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }
    public Date getEndDate() {
        return endDate;
    }
    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
}