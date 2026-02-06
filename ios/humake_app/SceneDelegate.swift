import UIKit
import React

class SceneDelegate: UIResponder, UIWindowSceneDelegate, RCTBridgeDelegate {

    var window: UIWindow?

    func sourceURL(for bridge: RCTBridge!) -> URL! {
        return RCTBundleURLProvider.sharedSettings()
            .jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
    }

    // ⭐ 여기!
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

        let bridge = RCTBridge(delegate: self, launchOptions: nil)

        // 🔥 TestFlight 전용 Red Screen
        if isTestFlight() {
            bridge?.setValue(true, forKey: "devSupportEnabled")
        }

        let rootView = RCTRootView(
            bridge: bridge!,
            moduleName: "humake",
            initialProperties: nil
        )

        let rootVC = UIViewController()
        rootVC.view = rootView

        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = rootVC
        self.window = window
        window.makeKeyAndVisible()
    }
}
