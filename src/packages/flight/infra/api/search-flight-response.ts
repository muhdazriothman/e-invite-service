export interface SearchFlightResponse {
    data: Data;
    status: string;
    token: string;
}

export interface Data {
    accommodations: any;
    brandCarousel: any;
    brandInlines: any;
    carHire: any;
    context: any;
    itineraries: Itineraries;
    packages: any;
}

export interface Itineraries {
    agents: null;
    alliances: null;
    buckets: Bucket[];
    context: Context;
    creatives: null;
    destinationImageUrl: string;
    filterStats: FilterStats;
    results: any[];
}

export interface Bucket {
    id: string;
    items: Item[];
    name: string;
}

export interface Item {
    eco?: Eco;
    fareAttributes: FareAttributes;
    farePolicy: FarePolicy;
    hasFlexibleOptions: boolean;
    id: string;
    isMashUp: boolean;
    isProtectedSelfTransfer: boolean;
    isSelfTransfer: boolean;
    legs: Leg[];
    price: Price;
    score: number;
    tags?: string[];
}

export interface Eco {
    ecoContenderDelta: number;
}

export interface FareAttributes {
}

export interface FarePolicy {
    isCancellationAllowed: boolean;
    isChangeAllowed: boolean;
    isPartiallyChangeable: boolean;
    isPartiallyRefundable: boolean;
}

export interface Leg {
    arrival: string;
    carriers: Carriers;
    departure: string;
    destination: LegDestination;
    durationInMinutes: number;
    id: string;
    isSmallestStops: boolean;
    origin: LegDestination;
    segments: Segment[];
    stopCount: number;
    timeDeltaInDays: number;
}

export interface Carriers {
    marketing: Carrier[];
    operationType: string;
    operating?: Carrier[];
}

export interface Carrier {
    alternateId: string;
    id: number;
    logoUrl: string;
    name: string;
    minPrice?: string;
}

export interface LegDestination {
    city: string;
    country: string;
    displayCode: string;
    entityId: string;
    id: string;
    isHighlighted: boolean;
    name: string;
}

export interface Segment {
    arrival: string;
    departure: string;
    destination: SegmentDestination;
    durationInMinutes: number;
    flightNumber: string;
    id: string;
    marketingCarrier: TingCarrier;
    operatingCarrier: TingCarrier;
    origin: SegmentDestination;
    transportMode: string;
}

export interface SegmentDestination {
    country: string;
    displayCode: string;
    flightPlaceId: string;
    name: string;
    parent: Parent;
    type: string;
}

export interface Parent {
    displayCode: string;
    flightPlaceId: string;
    name: string;
    type: string;
}

export interface TingCarrier {
    allianceId: number;
    alternateId: string;
    displayCode: string;
    id: number;
    name: string;
}

export interface Price {
    formatted: string;
    pricingOptionId: string;
    raw: number;
}

export interface Context {
    sessionId: string;
    status: string;
    totalResults: number;
}

export interface FilterStats {
    airports: FilterStatsAirport[];
    carriers: Carrier[];
    duration: Duration;
    hasCityOpenJaw: boolean;
    multipleCarriers: MultipleCarriers;
    stopPrices: StopPrices;
    total: number;
}

export interface FilterStatsAirport {
    airports: AirportAirport[];
    city: string;
}

export interface AirportAirport {
    entityId: string;
    id: string;
    name: string;
}

export interface Duration {
    max: number;
    min: number;
    multiCityMax: number;
    multiCityMin: number;
}

export interface MultipleCarriers {
    minPrice: string;
    rawMinPrice: null;
}

export interface StopPrices {
    direct: Direct;
    one: Direct;
    twoOrMore: TwoOrMore;
}

export interface Direct {
    formattedPrice: string;
    isPresent: boolean;
    rawPrice: number;
}

export interface TwoOrMore {
    isPresent: boolean;
}
