import UIKit
import React

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var bridge: RCTBridge!

    static var shared: AppDelegate {
        return UIApplication.shared.delegate as! AppDelegate
    }

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {

        // React Native bridge 초기화
        bridge = RCTBridge(delegate: self, launchOptions: launchOptions)

        // iOS 12 이하 / SceneDelegate 없는 경우 window 세팅
        if #available(iOS 13, *) {
            // iOS 13+는 SceneDelegate에서 처리
        } else {
            let rootView = RCTRootView(
                bridge: bridge,
                moduleName: "HumakeApp",
                initialProperties: nil
            )
            let rootVC = UIViewController()
            rootVC.view = rootView

            window = UIWindow(frame: UIScreen.main.bounds)
            window?.rootViewController = rootVC
            window?.makeKeyAndVisible()
        }

        return true
    }
}

extension AppDelegate: RCTBridgeDelegate {
    func sourceURL(for bridge: RCTBridge!) -> URL! {
        #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
        #else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }
}
