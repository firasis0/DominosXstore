# DOMINOS Shipping Frontend

Frontend-only shipping management UI. All data is local React state until the backend phase.

## Provider
- Add/edit provider
- Real image upload with preview
- Replace/remove logo
- Active/inactive state
- Search and status filter

## Provider coverage
- Add Wilaya coverage
- Edit coverage
- Office price + home price at provider/Wilaya level
- Activate/deactivate coverage
- Add municipality directly from every Wilaya
- Edit municipality
- Add/edit delivery offices
- Office address and active state

## Global geography
- Add/edit Wilaya
- Add/edit/remove municipalities
- Municipality removal is blocked when delivery offices still reference it, matching the database FK restriction.
- Geography is separate from provider coverage

## Backend mapping

shipping_providers
shipping_zones
province
municipality
delivery_offices

The frontend upload currently uses a local object URL for preview. During the server-side phase this will become multipart/form-data and the backend will return the stored image URL.
