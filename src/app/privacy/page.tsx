import PageContainer from "@/components/PageContainer";

export default function PrivacyPage() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">プライバシーポリシー</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. はじめに</h2>
            <p className="mb-4">
              本ウェブサイト（以下「当サイト」）では、訪問者の皆様のプライバシーを尊重し、
              個人情報の保護に努めています。このプライバシーポリシーでは、当サイトにおける
              情報の収集、使用、管理について説明します。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. 収集する情報</h2>
            <h3 className="text-xl font-medium mb-2">2.1 アナリティクス情報</h3>
            <p className="mb-4">
              当サイトでは、Vercel
              Analyticsを使用して、以下の情報を自動的に収集しています：
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>ページビュー数</li>
              <li>訪問者の大まかな地理的位置（国・地域レベル）</li>
              <li>使用しているブラウザとデバイスの種類</li>
              <li>参照元URL</li>
              <li>ページの読み込み速度（Web Vitals）</li>
            </ul>
            <p className="mb-4">
              これらの情報は匿名化されており、個人を特定することはできません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. 情報の使用目的</h2>
            <p className="mb-4">収集した情報は、以下の目的で使用します：</p>
            <ul className="list-disc pl-6 mb-4">
              <li>ウェブサイトのパフォーマンス改善</li>
              <li>ユーザー体験の向上</li>
              <li>コンテンツの最適化</li>
              <li>技術的な問題の特定と解決</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. クッキーの使用</h2>
            <p className="mb-4">
              Vercel
              Analyticsは、サイトのパフォーマンスを測定するために必要最小限の
              クッキーを使用する場合があります。これらのクッキーは、個人を特定する
              情報を含みません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. 第三者への情報提供
            </h2>
            <p className="mb-4">
              当サイトでは、収集した情報を第三者に販売、貸与、または提供することは
              ありません。ただし、法的要請がある場合を除きます。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. データの保管</h2>
            <p className="mb-4">
              収集されたアナリティクスデータは、Vercelのサーバーに安全に保管されます。
              データの保持期間は、Vercelのデータ保持ポリシーに従います。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. オプトアウト</h2>
            <p className="mb-4">
              アナリティクスによるデータ収集を希望されない場合は、ブラウザの設定で
              JavaScriptを無効にするか、広告ブロッカーを使用することで、データ収集を
              防ぐことができます。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. お問い合わせ</h2>
            <p className="mb-4">
              このプライバシーポリシーに関するご質問やご懸念がございましたら、
              お気軽にお問い合わせください。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. ポリシーの更新</h2>
            <p className="mb-4">
              当サイトは、必要に応じてこのプライバシーポリシーを更新する場合があります。
              重要な変更がある場合は、このページでお知らせします。
            </p>
            <p className="text-sm text-gray-600">
              最終更新日：{new Date().toLocaleDateString("ja-JP")}
            </p>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
