import UIKit
import React

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = (scene as? UIWindowScene) else { return }

        // React RootView
        let rootView = RCTRootView(
            bridge: AppDelegate.shared.bridge,
            moduleName: "HumakeApp",
            initialProperties: nil
        )
        let rootVC = UIViewController()
        rootVC.view = rootView

        // UIWindow 세팅
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = rootVC
        self.window = window
        window.makeKeyAndVisible()
    }
}
