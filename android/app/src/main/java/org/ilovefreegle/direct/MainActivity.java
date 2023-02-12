package org.ilovefreegle.direct;

import android.util.Log;
import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {

  public void onCreate(Bundle savedInstanceState) {
    //Log.e("PHDCC","org.ilovefreegle.direct onCreate A");
    super.onCreate(savedInstanceState);
    registerPlugin(GoogleAuth.class);
  }
}
