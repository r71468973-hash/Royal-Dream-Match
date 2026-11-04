# Google Play Console - Data Safety Questionnaire Guide (Google AdMob)

Follow these exact answers when completing the **Data Safety** questionnaire in Google Play Console under **Policy and programs > App content > Data safety**.

---

### Page 1: Data Collection and Security

| Question | Answer | Reason |
| :--- | :--- | :--- |
| **Does your app collect or share any of the required user data types?** | **Yes** | Google Mobile Ads SDK (AdMob) processes advertising device identifiers for banner, interstitial, and rewarded video ad delivery. |
| **Is all of the user data collected by your app encrypted in transit?** | **Yes** | Google AdMob uses HTTPS / TLS encryption for all ad requests and SDK transmissions. |
| **Do you provide a way for users to request that their data be deleted?** | **Yes** | Users can reset game progress in Settings > Reset Progress, or delete app data via Android Settings. |

---

### Page 2: Data Types (AdMob Integration)

Under **Device or other IDs**:
- Check **"Device or other IDs"** (e.g. Android Advertising ID / GAID used by Google Mobile Ads SDK).
- Click **Next** to define details for "Device or other IDs":
  1. **Is this data collected, shared, or both?**
     - Select: **Collected** and **Shared** (shared with Google AdMob network).
  2. **Is this data processed ephemerally?**
     - Select: **No**.
  3. **Is this data required for your app, or can users choose whether it's collected?**
     - Select: **Data collection is required** (required by AdMob SDK for ad serving).
  4. **Why is this user data collected?**
     - Select: **Advertising or marketing**.

---

### Page 3: Ads Declaration (Crucial!)

Under **Policy and programs > App content > Ads**:
- **Does your app contain ads?**
- Select: **"Yes, my app contains ads"** ✅

*(Matches Google Mobile Ads SDK in `AndroidManifest.xml` and `build.gradle`).*

---

### Page 4: Target Audience and Content

- **Target Age:** Select **13 and older** (or **All ages**).
- **News Apps:** Select **No**.
- **COVID-19 Contact Tracing:** Select **No**.
- **Financial Features:** Select **None**.
- **Government Apps:** Select **No**.
