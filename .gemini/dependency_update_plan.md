# Dependency Update Plan

## Safe Updates (Minor/Patch versions - Low Risk)

### Production Dependencies
- ✅ aws-sdk: 2.1392.0 → 2.1693.0 (patch)
- ✅ cors: 2.8.5 → 2.8.6 (patch)
- ✅ jsonwebtoken: 9.0.0 → 9.0.3 (patch)
- ✅ morgan: 1.9.1 → 1.10.1 (minor)
- ✅ passport: 0.6.0 → 0.7.0 (minor)
- ✅ swagger-ui-express: 4.3.0 → 5.0.1 (major but safe)
- ✅ ejs: 3.1.9 → 3.1.10 (patch)

### Dev Dependencies
- ✅ nodemon: 2.0.22 → 3.1.11 (major but safe)
- ✅ eslint-plugin-import: 2.25.4 → 2.32.0 (minor)

## Moderate Risk Updates (Need Testing)

- ⚠️ mongoose: 6.11.1 → 6.13.8 (patch - safe within v6)
- ⚠️ mongoose-paginate-v2: 1.3.52 → 1.9.1 (minor)
- ⚠️ dayjs: 1.10.8 → 1.11.19 (minor)
- ⚠️ joi: 17.3.0 → 18.0.2 (major - breaking changes possible)
- ⚠️ express: 4.18.2 → 4.22.1 (patch - safe within v4)
- ⚠️ express-rate-limit: 5.2.6 → 8.2.1 (major)
- ⚠️ express-list-endpoints: 5.0.0 → 7.1.1 (major)

## High Risk Updates (Breaking Changes Expected)

- 🔴 axios: 0.21.4 → 1.13.4 (major - API changes)
- 🔴 bcrypt: 5.0.0 → 6.0.0 (major)
- 🔴 dotenv: 8.2.0 → 17.2.3 (major)
- 🔴 debug: 2.6.9 → 4.4.3 (major)
- 🔴 mongoose: 6.x → 9.1.5 (major - significant changes)
- 🔴 express: 4.x → 5.2.1 (major - breaking changes)
- 🔴 eslint: 8.10.0 → 9.39.2 (major)
- 🔴 jest: 27.0.6 → 30.2.0 (major)
- 🔴 nodemailer: 6.7.8 → 8.0.0 (major)
- 🔴 formidable: 2.1.1 → 3.5.4 (major)
- 🔴 uuid: 8.3.2 → 13.0.0 (major)
- 🔴 supertest: 6.1.6 → 7.2.2 (major)
- 🔴 mongoose-unique-validator: 3.0.0 → 4.0.1 (major)

## Strategy

### Phase 1: Safe Updates (Now)
Update all low-risk packages to their latest compatible versions.

### Phase 2: Moderate Risk (After Testing)
Update packages with minor breaking changes, test thoroughly.

### Phase 3: High Risk (Separate Branch)
Create a separate branch for major version updates, update one at a time.

## Recommended Approach

1. **First**: Update to latest within current major versions (safest)
2. **Then**: Test the application thoroughly
3. **Later**: Plan major version upgrades in a separate branch
