package com.urlaubsplaner.uniprojekt.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urlaubsplaner.uniprojekt.database.TripConnector;
import com.urlaubsplaner.uniprojekt.templates.Trip;

@RestController
@RequestMapping("/api/trip")
public class TripApi {

    private final TripConnector tripConnector;

    public TripApi(TripConnector tripConnector) {
        this.tripConnector = tripConnector;
    }

    // GET all trips for the authenticated user (owned + shared)
    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips(@AuthenticationPrincipal long authId) {
        try {
            List<Trip> ownedTrips = tripConnector.getOwnedTrips(authId);
            List<Trip> sharedTrips = tripConnector.getSharedTrips(authId);
            
            // Combine both lists
            ownedTrips.addAll(sharedTrips);
            return ResponseEntity.ok(ownedTrips);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET specific trip by ID
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTrip(@PathVariable long id, @AuthenticationPrincipal long authId) {
        try {
            if (!tripConnector.isTripReadableBy(id, authId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Try to get from owned trips first, then shared trips
            List<Trip> ownedTrips = tripConnector.getOwnedTrips(authId);
            Trip trip = ownedTrips.stream()
                .filter(t -> t.getId() == id)
                .findFirst()
                .orElse(null);
                
            if (trip == null) {
                List<Trip> sharedTrips = tripConnector.getSharedTrips(authId);
                trip = sharedTrips.stream()
                    .filter(t -> t.getId() == id)
                    .findFirst()
                    .orElse(null);
            }
            
            if (trip != null) {
                return ResponseEntity.ok(trip);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST create new trip
    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip, @AuthenticationPrincipal long authId) {
        try {
            // Set the owner to the authenticated user
            trip.setOwnerAuthId(authId);
            
            long newId = tripConnector.createTrip(trip);
            if (newId > 0) {
                trip.setId(newId);
                return ResponseEntity.status(HttpStatus.CREATED).body(trip);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PUT update trip
    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable long id, @RequestBody Trip trip, @AuthenticationPrincipal long authId) {
        try {
            if (!tripConnector.isTripWritableBy(id, authId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            trip.setId(id);
            boolean updated = tripConnector.updateTrip(trip, authId);
            
            if (updated) {
                return ResponseEntity.ok(trip);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DELETE trip
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteTrip(@PathVariable long id, @AuthenticationPrincipal long authId) {
        try {
            // Check if user is owner (only owners can delete)
            List<Trip> ownedTrips = tripConnector.getOwnedTrips(authId);
            boolean isOwner = ownedTrips.stream().anyMatch(t -> t.getId() == id);
            
            if (!isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            boolean deleted = tripConnector.deleteTrip(id, authId);
            
            if (deleted) {
                return ResponseEntity.ok(true);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET trip participants (placeholder for future implementation)
    @GetMapping("/{id}/participant")
    public ResponseEntity<Object> getParticipants(@PathVariable long id, @AuthenticationPrincipal long authId) {
        try {
            if (!tripConnector.isTripReadableBy(id, authId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // TODO: Implement participant management
            return ResponseEntity.ok("[]"); // Empty array for now
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST add participant to trip (placeholder for future implementation)
    @PostMapping("/{id}/participant")
    public ResponseEntity<Boolean> addParticipant(@PathVariable long id, @RequestBody Object participantData, @AuthenticationPrincipal long authId) {
        try {
            if (!tripConnector.isTripWritableBy(id, authId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // TODO: Implement participant addition
            return ResponseEntity.ok(true);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET trip expenses (placeholder for future implementation)
    @GetMapping("/{id}/expense")
    public ResponseEntity<Object> getExpenses(@PathVariable long id, @AuthenticationPrincipal long authId) {
        try {
            if (!tripConnector.isTripReadableBy(id, authId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // TODO: Implement expense management
            return ResponseEntity.ok("[]"); // Empty array for now
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
