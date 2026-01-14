package com.urlaubsplaner.uniprojekt.database;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.urlaubsplaner.uniprojekt.templates.Trip;

@Repository
public class TripConnector {

    private final JdbcTemplate jdbc;

    public TripConnector(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // --- READ OWNED TRIPS ---
    public List<Trip> getOwnedTrips(long authId) {
        String sql = """
                    SELECT id,
                           destination,
                           owner,
                           budget,
                           start_date,
                           end_date,
                           created_at,
                           max_budget
                    FROM trips
                    WHERE owner = ?
                """;

        return jdbc.query(sql, rs -> {
            List<Trip> list = new ArrayList<>();
            while (rs.next()) {
                Trip t = new Trip(
                        rs.getLong("id"),
                        rs.getString("destination"),
                        rs.getLong("owner"),
                        (Integer) rs.getObject("budget"),
                        rs.getDate("start_date"),
                        rs.getDate("end_date"),
                        rs.getTimestamp("created_at"),
                        (Integer) rs.getObject("max_budget")
                );
                list.add(t);
            }
            return list;
        }, authId);
    }

    // --- READ SHARED TRIPS ---
    public List<Trip> getSharedTrips(long authId) {
        String sql = """
                    SELECT t.id,
                           t.destination,
                           t.owner,
                           t.budget,
                           t.start_date,
                           t.end_date,
                           t.created_at,
                           t.max_budget
                    FROM trips t
                    JOIN shared s ON s.trips_id = t.id
                    WHERE s.auth_id = ?
                """;

        return jdbc.query(sql, rs -> {
            List<Trip> list = new ArrayList<>();
            while (rs.next()) {
                Trip t = new Trip(
                        rs.getLong("id"),
                        rs.getString("destination"),
                        rs.getLong("owner"),
                        (Integer) rs.getObject("budget"),
                        rs.getDate("start_date"),
                        rs.getDate("end_date"),
                        rs.getTimestamp("created_at"),
                        (Integer) rs.getObject("max_budget")
                );
                list.add(t);
            }
            return list;
        }, authId);
    }

    // --- CREATE TRIP ---
    public long createTrip(Trip trip) {
        String sql = """
                    INSERT INTO trips (
                        destination,
                        owner,
                        budget,
                        start_date,
                        end_date,
                        max_budget
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    RETURNING id
                """;

        return jdbc.query(sql, rs -> {
            rs.next();
            return rs.getLong("id");
        },
                trip.getDestination(),
                trip.getOwnerAuthId(),
                trip.getBudget(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getMaxBudget());
    }

    // --- UPDATE TRIP (owned only) ---
    public boolean updateTrip(Trip trip, long authId) {
        StringBuilder sql = new StringBuilder("UPDATE trips SET ");
        List<Object> args = new ArrayList<>();

        if (trip.getDestination() != null) {
            sql.append("destination = ?, ");
            args.add(trip.getDestination());
        }
        if (trip.getBudget() != null) {
            sql.append("budget = ?, ");
            args.add(trip.getBudget());
        }
        if (trip.getStartDate() != null) {
            sql.append("start_date = ?, ");
            args.add(trip.getStartDate());
        }
        if (trip.getEndDate() != null) {
            sql.append("end_date = ?, ");
            args.add(trip.getEndDate());
        }
        if (trip.getMaxBudget() != null) {
            sql.append("max_budget = ?, ");
            args.add(trip.getMaxBudget());
        }

        if (args.isEmpty()) {
            return false; // nothing to update
        }

        sql.setLength(sql.length() - 2);
        sql.append(" WHERE id = ? AND owner = ?");
        args.add(trip.getId());
        args.add(authId);

        return jdbc.update(sql.toString(), args.toArray()) == 1;
    }

    // --- DELETE TRIP (owned only) ---
    public boolean deleteTrip(long tripId, long authId) {
        String sql = "DELETE FROM trips WHERE id = ? AND owner = ?";
        return jdbc.update(sql, tripId, authId) == 1;
    }

    // --- PERMISSIONS ---
    public boolean isTripReadableBy(long tripId, long authId) {
        String sql = """
                    SELECT EXISTS (
                        SELECT 1 FROM trips WHERE id = ? AND owner = ?
                    ) OR EXISTS (
                        SELECT 1 FROM shared WHERE trips_id = ? AND auth_id = ?
                    )
                """;
        Boolean result = jdbc.queryForObject(sql, Boolean.class, tripId, authId, tripId, authId);
        return result != null && result;
    }

    public boolean isTripWritableBy(long tripId, long authId) {
        String sql = """
                    SELECT EXISTS (
                        SELECT 1 FROM trips WHERE id = ? AND owner = ?
                    ) OR EXISTS (
                        SELECT 1 FROM shared WHERE trips_id = ? AND auth_id = ? AND role IN ('editor','owner')
                    )
                """;
        Boolean result = jdbc.queryForObject(sql, Boolean.class, tripId, authId, tripId, authId);
        return result != null && result;
    }
}
