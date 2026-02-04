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

        // 1. React Native JS Bundle 경로
        let jsCodeLocation: URL
        #if DEBUG
        jsCodeLocation = URL(string: "http://localhost:8081/index.bundle?platform=ios")!
        #else
        jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
        #endif

        // 2. React RootView 생성
        let rootView = RCTRootView(
            bundleURL: jsCodeLocation,
            moduleName: "humake_app", // index.js에서 AppRegistry.registerComponent('humake_app', ...)
            initialProperties: nil,
            launchOptions: nil
        )

        // 배경색 지정 (검은 화면 방지)
        rootView.backgroundColor = UIColor.white

        // 3. UIWindow 생성 및 설정
        let window = UIWindow(windowScene: windowScene)
        let rootViewController = UIViewController()
        rootViewController.view = rootView
        window.rootViewController = rootViewController
        self.window = window
        window.makeKeyAndVisible()
    }

    // 나머지는 그대로
    func sceneDidDisconnect(_ scene: UIScene) { }
    func sceneDidBecomeActive(_ scene: UIScene) { }
    func sceneWillResignActive(_ scene: UIScene) { }
    func sceneWillEnterForeground(_ scene: UIScene) { }
    func sceneDidEnterBackground(_ scene: UIScene) { }
}
