package org.ilovefreegle.direct;

import android.util.Log;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import ee.forgr.capacitor.social.login.GoogleProvider;
import ee.forgr.capacitor.social.login.SocialLoginPlugin;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.Plugin;
import android.content.Intent;

public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {

  public void onCreate(Bundle savedInstanceState) {
    //Log.e("PHDCC","org.ilovefreegle.direct onCreate A");
    super.onCreate(savedInstanceState);

    // Enable WebView debugging for chrome://inspect in debug builds
    if (BuildConfig.DEBUG) {
      WebView.setWebContentsDebuggingEnabled(true);
      Log.d("MainActivity", "WebView debugging enabled for chrome://inspect");
    }

    registerPlugin(com.getcapacitor.community.stripe.StripePlugin.class);
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    
    if (requestCode >= GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MIN && requestCode < GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MAX) {
      PluginHandle pluginHandle = getBridge().getPlugin("SocialLogin");
      if (pluginHandle == null) {
        Log.i("Google Activity Result", "SocialLogin login handle is null");
        return;
      }
      Plugin plugin = pluginHandle.getInstance();
      if (!(plugin instanceof SocialLoginPlugin)) {
        Log.i("Google Activity Result", "SocialLogin plugin instance is not SocialLoginPlugin");
        return;
      }
      ((SocialLoginPlugin) plugin).handleGoogleLoginIntent(requestCode, data);
    }
  }

  public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}
}
