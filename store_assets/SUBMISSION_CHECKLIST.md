# Google Play Store Submission Walkthrough

This guide walks you step-by-step through publishing **Royal Dream Match** on the **Google Play Console**.

---

### Step 1: Your Production Build Files

All production assets and signing credentials have been configured:

1. **AAB File Location for Upload:**
   - Local / Workspace Path: `build-artifacts/Royal-Dream-Match.aab`
   - Secondary Path: `android/app/build/outputs/bundle/release/app-release.aab`
   - Download from GitHub: Under GitHub Actions run artifacts named **`Royal-Dream-Match-AAB`** or under **GitHub Releases**.

2. **Production Keystore (Keep this file backed up safely!):**
   - Location: `android/app/royal-dream-match-release.keystore`
   - Keystore Type: `PKCS12`
   - Key Alias: `royaldreammatch`
   - Keystore Password: `RoyalMatch2026Production!`
   - Key Password: `RoyalMatch2026Production!`
   - Certificate: RSA 2048-bit, 10,000 days validity (~27 years)

3. **Store Visual Assets:**
   - App Icon (512x512): `store_assets/app_icon_512x512.png`
   - Feature Graphic (1024x500): `store_assets/feature_graphic_1024x500.png`
   - Phone Screenshots: `store_assets/screenshots/` (4 screenshots, 1080x1920)

---

### Step 2: Google Play Console Submission Steps

#### 1. Create App
1. Go to [Google Play Console](https://play.google.com/console).
2. Click **Create app** (top-right).
3. **App name:** `Royal Dream Match`
4. **Default language:** English (United States)
5. **App or game:** Game
6. **Free or paid:** Free
7. Accept the Declarations and click **Create app**.

---

#### 2. Complete "Set up your app" Tasks
In the Dashboard, complete each item in the checklist:
- **Privacy Policy:** Paste your public Privacy Policy URL (e.g. your GitHub Pages URL hosting `public/privacy-policy.html`).
- **App Access:** Select *"All functionality is available without special access"*.
- **Ads:** Select *"Yes, my app contains ads"* (Google AdMob Banner SDK integrated).
- **Content Rating:**
  - Start questionnaire -> Select **Game**.
  - Fill in your email.
  - Violence, Sex, Language, Drugs, Gambling -> Select **No** for all.
  - Click **Save** and **Submit**. You will receive an **ESRB Everyone / PEGI 3 / USK 0** rating.
- **Target Audience:** Select **13 and older** (or appropriate target).
- **News App:** Select **No**.
- **COVID-19 Contact Tracing:** Select **No**.
- **Data Safety:** Refer to `store_assets/GOOGLE_PLAY_DATA_SAFETY.md` for exact answers.
- **Government Apps:** Select **No**.
- **Financial Features:** Select **None**.

---

#### 3. Main Store Listing
Navigate to **Grow > Store presence > Main store listing**:
1. Copy **Short Description** and **Full Description** from `store_assets/PLAY_STORE_METADATA.md`.
2. Upload **App icon**: `store_assets/app_icon_512x512.png`.
3. Upload **Feature graphic**: `store_assets/feature_graphic_1024x500.png`.
4. Upload **Phone screenshots**: Select all 4 images from `store_assets/screenshots/`.
5. Click **Save**.

---

#### 4. Create and Rollout Release
1. In the left menu, select **Production** (or **Closed testing** / **Internal testing** if testing first).
2. Click **Create new release** (top-right).
3. Under **Play App Signing**, click **Continue** (Google Play will use your upload key).
4. Drag and drop **`Royal-Dream-Match.aab`** into the upload area.
5. Enter **Release name:** `1.0.0 (1)`.
6. Enter **Release notes:**
   ```text
   Initial release of Royal Dream Match!
   - 100 handcrafted match-3 puzzle levels
   - Explosive Rocket, TNT Bomb, and Rainbow Orb boosters
   - 7-day Daily Treasure rewards
   - Majestic royal palace theme and court music
   ```
7. Click **Next** > **Save** > **Review release**.
8. Click **Start rollout to Production** (or Submit for Review).

Google Play typically reviews new apps within 1–3 business days. Once approved, the status will show as **Available on Google Play**!
