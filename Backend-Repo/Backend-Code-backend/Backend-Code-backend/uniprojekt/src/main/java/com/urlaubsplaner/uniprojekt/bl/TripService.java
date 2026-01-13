package com.urlaubsplaner.uniprojekt.bl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.urlaubsplaner.uniprojekt.database.TripConnector;
import com.urlaubsplaner.uniprojekt.templates.Trip;
import com.urlaubsplaner.uniprojekt.templates.Activity;

@Service
public class TripService {

    private final TripConnector tripConnector;

    public TripService(com.urlaubsplaner.uniprojekt.database.TripConnector tripConnector) {
        this.tripConnector = tripConnector;
    }

    public List<Trip> getOwnedTrips(long authId) {
        if (authId <= 0) {
            return null;
        }
        return tripConnector.getOwnedTrips(authId);
    }

    public List<Trip> getSharedTrips(long authId) {
        if (authId <= 0) {
            return null;
        }
        return tripConnector.getSharedTrips(authId);
    }

    public long createTrip(Trip trip) {
        if (trip == null || trip.getOwnerAuthId() <= 0) {
            return -1L;
        }
        return tripConnector.createTrip(trip);
    }

    public boolean updateTrip(Trip trip, long authId) {
        if (authId <= 0 || trip == null || !tripConnector.isTripWritableBy(trip.getId(), authId)) {
            return false;
        }
        return tripConnector.updateTrip(trip, authId);
    }

    public boolean deleteTrip(Trip trip, long authId) {
        if (authId <= 0 || trip == null || trip.getOwnerAuthId() != authId) {
            return false;
        }
        return tripConnector.deleteTrip(trip.getId(), authId);
    }

    public List<Activity> getTripActivities(long tripId, long authId) {
        if (authId <= 0 || tripId <= 0 || !tripConnector.isTripReadableBy(tripId,  authId)) {
            return null;
        }
        return tripConnector.getActivitiesForTrip(tripId);
    }

    public long addActivityToTrip(long tripId, Activity activity, long authId) {
        if (authId <= 0 || tripId <= 0 || activity == null || !tripConnector.isTripWritableBy(tripId, authId)) {
            return -1L;
        }
        return tripConnector.createActivity(tripId, activity);
    }

    public boolean updateActivityInTrip(long tripId, Activity activity, long authId) {
        if (authId <= 0 || tripId <= 0 || activity == null || !tripConnector.isTripWritableBy(tripId, authId)) {
            return false;
        }
        return tripConnector.updateActivity(tripId, activity);
    }

    public boolean deleteActivityFromTrip(Trip trip, long activityId, long authId) {
        if (authId <= 0 || trip == null || activityId <= 0 || trip.getOwnerAuthId() != authId) {
            return false;
        }
        return tripConnector.deleteActivity(activityId);
    }
}
