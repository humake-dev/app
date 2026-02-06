import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

class SceneDelegate: UIResponder, UIWindowSceneDelegate, RCTBridgeDelegate {

    var window: UIWindow?

    func sourceURL(for bridge: RCTBridge!) -> URL! {
        return RCTBundleURLProvider.sharedSettings()
            .jsBundleURL(forBundleRoot: "index", fallbackResource: "main")
    }

    func isTestFlight() -> Bool {
        guard let receiptURL = Bundle.main.appStoreReceiptURL else {
            return false
        }
        return receiptURL.lastPathComponent == "sandboxReceipt"
    }

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = (scene as? UIWindowScene) else { return }

        // ⭐ RN 필수 초기화
        RCTAppSetupPrepareApp(UIApplication.shared)

        let bridge = RCTBridge(delegate: self, launchOptions: nil)

        if isTestFlight() {
            bridge?.setValue(true, forKey: "devSupportEnabled")
        }

        // ⭐ RN 권장 RootView 생성 방식
        let rootView = RCTAppSetupDefaultRootView(
            bridge,
            "humake_app",
            nil
        )

        let rootVC = UIViewController()
        rootVC.view = rootView

        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = rootVC
        self.window = window
        window.makeKeyAndVisible()
    }
}
