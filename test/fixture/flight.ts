import { Flight } from "@flight/domain/entities/flight";

export class FlightFixture {
    static getFlightProps(props: Partial<Flight>) {
        const {
            id = "11442-2505121038--32573-1-12240-2505121708|12240-2505152130--32573-1-12712-2505161528",
            price = 711.8,
            priceFormatted = "$712",
            priceAfterDiscount = 640.62,
            priceAfterDiscountFormatted = "$641",
            legs = [
                {
                    arrival: "2025-05-12T17:08:00",
                    departure: "2025-05-12T10:38:00",
                    originCode: "EWR",
                    originName: "New York Newark",
                    destinationCode: "HNL",
                    destinationName: "Honolulu International",
                    durationInMinutes: 750,
                    stopCount: 1,
                    segments: [
                        {
                            arrival: "2025-05-12T13:10:00",
                            departure: "2025-05-12T10:38:00",
                            originCode: "EWR",
                            originName: "New York Newark",
                            destinationCode: "PHX",
                            destinationName: "Phoenix Sky Harbor",
                            carrier: "American Airlines",
                            flightNumber: "3058"
                        },
                        {
                            arrival: "2025-05-12T17:08:00",
                            departure: "2025-05-12T13:35:00",
                            originCode: "PHX",
                            originName: "Phoenix Sky Harbor",
                            destinationCode: "HNL",
                            destinationName: "Honolulu International",
                            carrier: "American Airlines",
                            flightNumber: "675"
                        }
                    ]
                },
                {
                    arrival: "2025-05-16T15:28:00",
                    departure: "2025-05-15T21:30:00",
                    originCode: "HNL",
                    originName: "Honolulu International",
                    destinationCode: "JFK",
                    destinationName: "New York John F. Kennedy",
                    durationInMinutes: 718,
                    stopCount: 1,
                    segments: [
                        {
                            arrival: "2025-05-16T06:04:00",
                            departure: "2025-05-15T21:30:00",
                            originCode: "HNL",
                            originName: "Honolulu International",
                            destinationCode: "LAX",
                            destinationName: "Los Angeles International",
                            carrier: "American Airlines",
                            flightNumber: "144"
                        },
                        {
                            arrival: "2025-05-16T15:28:00",
                            departure: "2025-05-16T07:00:00",
                            originCode: "LAX",
                            originName: "Los Angeles International",
                            destinationCode: "JFK",
                            destinationName: "New York John F. Kennedy",
                            carrier: "American Airlines",
                            flightNumber: "2"
                        }
                    ]
                }
            ]
        } = props;

        return {
            id,
            price,
            priceFormatted,
            priceAfterDiscount,
            priceAfterDiscountFormatted,
            legs,
        }
    }

    static getFlightEntity(params: Partial<Flight>) {
        return new Flight(FlightFixture.getFlightProps(params));
    }
}
