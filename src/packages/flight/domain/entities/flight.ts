export interface FlightProps {
    id: string;
    legs: FlightLeg[];
    price: number;
    priceFormatted: string;
    priceAfterDiscount: number;
    priceAfterDiscountFormatted: string;
}

export interface FlightLeg {
    arrival: string;
    departure: string;
    originCode: string;
    originName: string;
    destinationCode: string;
    destinationName: string;
    durationInMinutes: number;
    stopCount: number;
    segments: FlightSegment[];
}

export interface FlightSegment {
    arrival: string;
    departure: string;
    originCode: string;
    originName: string;
    destinationCode: string;
    destinationName: string;
    carrier: string;
    flightNumber: string;
}


const MAX_DISCOUNT_RATE = 0.10;

export class Flight {
    public id: string;
    public legs: FlightLeg[];
    public price: number;
    public priceFormatted: string;
    public priceAfterDiscount: number;
    public priceAfterDiscountFormatted: string;

    constructor(flight: FlightProps) {
        this.id = flight.id;
        this.legs = flight.legs;
        this.price = flight.price;
        this.priceFormatted = flight.priceFormatted;
        this.priceAfterDiscount = flight.priceAfterDiscount;
        this.priceAfterDiscountFormatted = flight.priceAfterDiscountFormatted;
    }

    applyDiscount(discountRate: number): void {
        if (discountRate > MAX_DISCOUNT_RATE) {
            throw new Error('Discount rate cannot be greater than 10%');
        }

        this.priceAfterDiscount = this.price * (1 - discountRate);
        this.priceAfterDiscountFormatted = `$${Math.ceil(this.priceAfterDiscount)}`;
    }
}


