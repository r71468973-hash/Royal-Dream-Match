package com.royaldream.match;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.OnUserEarnedRewardListener;

@CapacitorPlugin(name = "AdMobNative")
public class AdMobPlugin extends Plugin {
    private static final String TAG = "AdMobNative";

    // Internal Production AdMob Ad Unit IDs
    private static final String DEFAULT_BANNER_ID = "ca-app-pub-4935356006715377/9653779021";
    private static final String DEFAULT_INTERSTITIAL_ID = "ca-app-pub-4935356006715377/2028450772";
    private static final String DEFAULT_REWARDED_ID = "ca-app-pub-4935356006715377/5224354917";

    private RewardedAd mRewardedAd;
    private InterstitialAd mInterstitialAd;
    private AdView mAdView;

    @PluginMethod
    public void showBanner(PluginCall call) {
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        final String adUnitId = call.getString("adUnitId", DEFAULT_BANNER_ID);

        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                if (mAdView != null) {
                    mAdView.destroy();
                    ViewGroup parent = (ViewGroup) mAdView.getParent();
                    if (parent != null) parent.removeView(mAdView);
                }

                mAdView = new AdView(activity);
                mAdView.setAdSize(AdSize.BANNER);
                mAdView.setAdUnitId(adUnitId);

                FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL
                );

                activity.addContentView(mAdView, params);

                AdRequest adRequest = new AdRequest.Builder().build();
                mAdView.loadAd(adRequest);

                JSObject ret = new JSObject();
                ret.put("status", "loaded");
                call.resolve(ret);
            } catch (Exception e) {
                Log.e(TAG, "Error showing banner: " + e.getMessage());
                call.reject("Failed to show banner: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void hideBanner(PluginCall call) {
        new Handler(Looper.getMainLooper()).post(() -> {
            if (mAdView != null) {
                mAdView.setVisibility(android.view.View.GONE);
                ViewGroup parent = (ViewGroup) mAdView.getParent();
                if (parent != null) parent.removeView(mAdView);
                mAdView.destroy();
                mAdView = null;
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        final String adUnitId = call.getString("adUnitId", DEFAULT_INTERSTITIAL_ID);

        new Handler(Looper.getMainLooper()).post(() -> {
            if (mInterstitialAd != null) {
                displayLoadedInterstitial(activity, call);
                return;
            }

            AdRequest adRequest = new AdRequest.Builder().build();
            InterstitialAd.load(activity, adUnitId, adRequest, new InterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull InterstitialAd interstitialAd) {
                    mInterstitialAd = interstitialAd;
                    displayLoadedInterstitial(activity, call);
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    mInterstitialAd = null;
                    Log.w(TAG, "Interstitial failed to load: " + loadAdError.getMessage());
                    JSObject ret = new JSObject();
                    ret.put("success", false);
                    ret.put("error", "Ad not available. Please try again.");
                    call.resolve(ret);
                }
            });
        });
    }

    private void displayLoadedInterstitial(Activity activity, PluginCall call) {
        mInterstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override
            public void onAdDismissedFullScreenContent() {
                mInterstitialAd = null;
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            }

            @Override
            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                mInterstitialAd = null;
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", "Ad not available. Please try again.");
                call.resolve(ret);
            }
        });
        mInterstitialAd.show(activity);
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        final String adUnitId = call.getString("adUnitId", DEFAULT_REWARDED_ID);

        new Handler(Looper.getMainLooper()).post(() -> {
            AdRequest adRequest = new AdRequest.Builder().build();
            RewardedAd.load(activity, adUnitId, adRequest, new RewardedAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull RewardedAd rewardedAd) {
                    mRewardedAd = rewardedAd;
                    final boolean[] rewardEarned = {false};
                    final int[] rewardAmount = {0};

                    mRewardedAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override
                        public void onAdDismissedFullScreenContent() {
                            mRewardedAd = null;
                            JSObject ret = new JSObject();
                            ret.put("rewarded", rewardEarned[0]);
                            ret.put("amount", rewardAmount[0]);
                            if (!rewardEarned[0]) {
                                ret.put("error", "Ad closed before reward was completed.");
                            }
                            call.resolve(ret);
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                            mRewardedAd = null;
                            JSObject ret = new JSObject();
                            ret.put("rewarded", false);
                            ret.put("error", "Ad not available. Please try again.");
                            call.resolve(ret);
                        }
                    });

                    mRewardedAd.show(activity, new OnUserEarnedRewardListener() {
                        @Override
                        public void onUserEarnedReward(@NonNull RewardItem item) {
                            rewardEarned[0] = true;
                            rewardAmount[0] = item.getAmount();
                        }
                    });
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    mRewardedAd = null;
                    Log.w(TAG, "Rewarded ad failed to load: " + loadAdError.getMessage());
                    JSObject ret = new JSObject();
                    ret.put("rewarded", false);
                    ret.put("error", "Ad not available. Please try again.");
                    call.resolve(ret);
                }
            });
        });
    }
}
