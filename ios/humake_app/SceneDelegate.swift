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

        // 1️⃣ React Native 브리지 생성
        let bridge = RCTBridge(delegate: nil, launchOptions: nil)

        // 2️⃣ React Native 루트 뷰 생성
        let rootView = RCTRootView(
            bridge: bridge,
            moduleName: "humake_app",  // 여기에 JS에서 등록한 앱 이름
            initialProperties: nil
        )

        // 3️⃣ 루트 뷰 컨트롤러 생성
        let rootViewController = UIViewController()
        rootViewController.view = rootView

        // 4️⃣ 윈도우 생성 및 루트뷰 컨트롤러 연결
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = rootViewController
        self.window = window
        window.makeKeyAndVisible()

        // 5️⃣ (선택) 상태바 스타일 조정
        rootViewController.overrideUserInterfaceStyle = .light
    }
}
