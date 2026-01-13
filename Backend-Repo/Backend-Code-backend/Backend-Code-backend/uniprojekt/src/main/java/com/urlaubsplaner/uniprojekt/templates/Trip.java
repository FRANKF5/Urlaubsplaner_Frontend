package com.urlaubsplaner.uniprojekt.templates;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

public class Trip {
    private long id;
    private String destination;
    private long ownerAuthId;
    private Integer budget;
    private Date startDate;
    private Date endDate;
    private Timestamp createdAt;
    private List<Activity> activities;

    public Trip() {}

    // Konstruktor mit allen 8 Parametern
    public Trip(long id, String destination, long ownerAuthId, Integer budget,
                Date startDate, Date endDate, Timestamp createdAt, List<Activity> activities) {
        this.id = id;
        this.destination = destination;
        this.ownerAuthId = ownerAuthId;
        this.budget = budget;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = createdAt;
        this.activities = activities;
    }

    // Getter/Setter...
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public long getOwnerAuthId() { return ownerAuthId; }
    public void setOwnerAuthId(long ownerAuthId) { this.ownerAuthId = ownerAuthId; }
    public Integer getBudget() { return budget; }
    public void setBudget(Integer budget) { this.budget = budget; }
    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }
    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    public List<Activity> getActivities() { return activities; }
    public void setActivities(List<Activity> activities) { this.activities = activities; }
}
