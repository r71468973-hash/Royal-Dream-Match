package com.royaldream.match;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.MobileAds;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdMobPlugin.class);
        super.onCreate(savedInstanceState);

        // Initialize Google Mobile Ads SDK asynchronously
        MobileAds.initialize(this, initializationStatus -> {});
    }
}
