import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  
  // Check if user is already logged in by looking for whop session
  const isLoggedIn = headersList.get("x-whop-user-id") || userAgent?.includes("Whop");
  
  if (isLoggedIn) {
    redirect("/dashboard");
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <h1 className="text-2xl font-bold text-white">AmpFlow</h1>
            </div>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] hover:from-[#DD2F6E]/90 hover:to-[#f53c79]/90 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <div className="w-6 h-6 bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <span className="text-white/90 text-sm font-medium">Built for Whop Communities</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Automate Your Content
              <span className="bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] bg-clip-text text-transparent"> Distribution</span>
            </h2>
            
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Connect your YouTube channel and automatically share new videos to your Whop community. 
              Expand your reach with Discord and Telegram integration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] hover:from-[#DD2F6E]/90 hover:to-[#f53c79]/90 text-white px-8 py-6 text-lg">
                  Connect Whop Account
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">How It Works</h3>
              <p className="text-white/70 text-lg">Simple automation for content creators</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🔴</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Connect YouTube</h4>
                <p className="text-white/70">Link your YouTube channel as the content source for automatic monitoring.</p>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                <div className="w-12 h-12 bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl font-bold">W</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Set Up Whop</h4>
                <p className="text-white/70">Connect your Whop community as the primary destination for your content.</p>
              </Card>
              
              <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Automate Distribution</h4>
                <p className="text-white/70">New videos automatically get shared to your connected platforms.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Platform Support Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-8">Supported Platforms</h3>
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] rounded-xl flex items-center justify-center mb-2">
                  <span className="text-white text-2xl font-bold">W</span>
                </div>
                <p className="text-white font-semibold">Whop</p>
                <p className="text-white/60 text-sm">Primary</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-white text-2xl">🔴</span>
                </div>
                <p className="text-white font-semibold">YouTube</p>
                <p className="text-white/60 text-sm">Source</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-white text-2xl">💬</span>
                </div>
                <p className="text-white font-semibold">Discord</p>
                <p className="text-white/60 text-sm">Optional</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-white text-2xl">✈️</span>
                </div>
                <p className="text-white font-semibold">Telegram</p>
                <p className="text-white/60 text-sm">Optional</p>
              </div>
            </div>
            <p className="text-white/70">Start with Whop, expand to Discord and Telegram as needed.</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Automate Your Content?</h3>
            <p className="text-xl text-white/80 mb-8">Join content creators who are saving time and growing their communities with automated distribution.</p>
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] hover:from-[#DD2F6E]/90 hover:to-[#f53c79]/90 text-white px-8 py-6 text-lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}