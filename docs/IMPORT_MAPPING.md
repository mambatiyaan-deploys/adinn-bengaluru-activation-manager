# Corrected Import Mapping

This enhanced V5 build uses category-aware Excel parsing.

## Correct mappings included

- RWA sheets: `Name` -> Location name, `Area` -> Area, `# Units` -> Units, `# Occupied` -> Occupied, `% Occupancy` -> Occupancy, `Contact` -> Phone/email/contact details.
- IT PARKS: `IT PARKS AND COWORKING` -> Location name, `NAME` -> Contact person, `CONT` -> Phone, `HEAD COUNT` -> Footfall, `Google Link` -> Map link, `Company Name` -> Notes.
- MALLS: `malls name` -> Location name, `location` -> Area, `name` -> Contact person, `rates` -> Rate.
- VENDORS: `CAMPONY/CAMpony/company names` -> Vendor/company name, `NAME` -> Contact person, `CONT` -> Phone.
- GYMS: `Gym Details` -> Gym name, `Location` -> Google link/address, `Rental Per Day` -> Rate, `Footfall` -> Footfall.
- RETAIL STORE: detects row 2 as header and maps `STORE NAME`, `AREA`, `PINCODE`, `NAME`, `CONT NUMBER`.
- CST CANTEEN/GOVT: `Direction` is treated as Google link when it contains a URL.
- HOTELS: `HOTEL NAME` -> Hotel name, `location` -> Google link, `BASIC RATE` -> Rate, banquet/capacity fields -> Notes.

Extra or unknown columns are preserved in the `extra` JSON field.

## GPS columns

The importer now detects GPS data from any of these Excel header names:

- Latitude, Lat, GPS Latitude, GPS Lat
- Longitude, Long, Lng, GPS Longitude, GPS Lng
- GPS, GPS Location, GPS Coordinates, Coordinates, Lat Long, Lat Lng
- Google Maps URLs containing `@lat,lng`, `!3dlat!4dlng`, `q=lat,lng`, `query=lat,lng`, `ll=lat,lng`, or `center=lat,lng`

If no exact coordinates are present, the app stores a Google Maps search/open URL so every record still has a map-accessible location field.
