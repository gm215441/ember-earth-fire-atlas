# EMBER limitations

## Detection is not fire truth

A FIRMS active-fire row is a detected thermal-anomaly pixel. A single event can
produce many pixels and repeat observations. The record does not directly give
unique fires, ignition counts, perimeter, burned area, cause, severity, damage,
emissions, or whether an event is agricultural versus wildland fire. Source
`type=0` is never presented as a verified wildfire classification.

## Positive-only data cannot prove coverage

The raw detection tables contain positive detections. They do not contain the
observation mask needed to decide whether a location was observed cloud-free and
had no detection. Consequently:

- zero matching rows is **not** confirmed no-fire;
- missing rows are **not** assumed to be zero;
- EMBER does not calculate observed-area coverage from positive detections; and
- cloud, smoke, orbit gaps and unavailable source partitions remain possible.

A future coverage claim would require a documented observation-quality product,
such as an appropriate fire-mask/quality layer, processed at compatible space
and time resolution.

## Instruments are not interchangeable

MODIS and VIIRS differ in spatial sampling, sensitivity, overpass timing,
platform history and confidence semantics. Fleet growth can increase detected
pixels independently of physical fire change. Separate panels and independent
vertical scales are intentional. The within-sensor seasonal indices are not a
combined trend and not scientific harmonization.

## AOI and calendar assumptions

Punjab and California use verified administrative bounding boxes, not polygon
clips. Border-adjacent detections outside the administrative polygon can be
included inside those rectangles. All acquisition dates are UTC; users near a
date boundary may expect a different local civil date.

## Duplicate handling

The pipeline reports source rows and exact duplicate identities separately. Its
identity uses acquisition UTC, sensor, satellite, quality, FRP, day/night,
native confidence, type code and coordinates. Removing an exact identity is a
data hygiene choice, not a claim that nearby or same-event pixels are duplicate
fires. Non-identical detections are retained.

## Climate and causal interpretation

Seasonal and historical patterns can reflect weather and climate, but also land
management, crop cycles, sensor availability, cloud/smoke, reporting latency,
and other factors. EMBER does not attribute a pattern to climate change,
forecast fire, issue emergency warnings, or infer cause from these detections.

## Provisional records and mirror status

NRT rows are provisional and visibly labeled. The Portolan catalog is an
independent mirror of NASA FIRMS rather than NASA itself. Source ETags,
last-modified times and extraction timestamps are recorded so a build can be
audited; a later mirror refresh may change the snapshot.
