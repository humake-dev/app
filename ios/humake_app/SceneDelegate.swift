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

        // React Native bridge 생성
        let bridge = RCTBridge(delegate: self as! RCTBridgeDelegate, launchOptions: nil)

        // rootView 생성
        let rootView = RCTRootView(
            bridge: bridge!,
            moduleName: "humake_app", // RN JS 모듈 이름
            initialProperties: nil
        )

        // 루트 뷰 컨트롤러 설정
        let rootViewController = UIViewController()
        rootViewController.view = rootView

        // UIWindow 설정
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = rootViewController
        self.window = window
        window.makeKeyAndVisible()
    }
}
