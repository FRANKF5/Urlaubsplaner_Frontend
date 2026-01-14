package com.urlaubsplaner.uniprojekt.templates;

import java.sql.Date;
import java.sql.Timestamp;

public class Trip {
    private long id;
    private String destination;
    private long ownerAuthId; // owner (auth_id)
    private Integer budget; // optional/nullable
    private Date startDate;
    private Date endDate;
    private Timestamp createdAt;
    private Integer maxBudget; // optional/nullable

    public Trip() {
    }

    public Trip(long id, String destination, long ownerAuthId, Integer budget,
                Date startDate, Date endDate, Timestamp createdAt, Integer maxBudget) {
        this.id = id;
        this.destination = destination;
        this.ownerAuthId = ownerAuthId;
        this.budget = budget;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = createdAt;
        this.maxBudget = maxBudget;
    }

    public Trip(String destination, long ownerAuthId, Integer budget,
                Date startDate, Date endDate, Integer maxBudget) {
        this(0L, destination, ownerAuthId, budget, startDate, endDate, null, maxBudget);
    }

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }
    public String getDestination() {
        return destination;
    }
    public void setDestination(String destination) {
        this.destination = destination;
    }
    public long getOwnerAuthId() {
        return ownerAuthId;
    }
    public void setOwnerAuthId(long ownerAuthId) {
        this.ownerAuthId = ownerAuthId;
    }
    public Integer getBudget() {
        return budget;
    }
    public void setBudget(Integer budget) {
        this.budget = budget;
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
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    public Integer getMaxBudget() {
        return maxBudget;
    }
    public void setMaxBudget(Integer maxBudget) {
        this.maxBudget = maxBudget;
    }
}
