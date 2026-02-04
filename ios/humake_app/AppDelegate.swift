import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    // iOS 13+에서는 window를 SceneDelegate가 관리하므로 여기서는 선언 안 함

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // 여기서는 필요한 초기화만
        return true
    }

    // Scene 설정
    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        return UISceneConfiguration(
            name: "Default Configuration",
            sessionRole: connectingSceneSession.role
        )
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // 필요시 세션 정리
    }
}
