import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { BookOpen, Brain, BarChart3, FileText, ArrowRight, Sparkles, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="h-12 w-12 mr-3 text-yellow-300" />
                <h1 className="text-6xl font-bold tracking-tight">
                  Re-Gent
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Your Intelligent Regulatory Assistant - Powered by AI to navigate complex banking regulations with confidence
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/policy-qa">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg">
                    Explore Policy Q&A
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/excel">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg">
                    Excel Analysis
                    <BarChart3 className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Revolutionize Your Regulatory Workflow
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Re-Gent combines cutting-edge AI with deep regulatory knowledge to provide instant, accurate answers to your compliance questions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">AI-Powered Insights</h3>
                <p className="text-gray-600">
                  Advanced natural language processing understands your questions and provides contextual answers from regulatory documents.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Regulatory Compliance</h3>
                <p className="text-gray-600">
                  Stay up-to-date with the latest banking regulations, guidelines, and compliance requirements from authoritative sources.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Excel Analysis</h3>
                <p className="text-gray-600">
                  Upload and analyze Excel files with AI-powered insights, formula generation, and regulatory data validation.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Product Features */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need for Regulatory Excellence
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Comprehensive Document Library</h3>
                      <p className="text-gray-600">
                        Access thousands of regulatory documents, guidelines, and compliance materials from leading financial authorities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Smart Search & Filtering</h3>
                      <p className="text-gray-600">
                        Find exactly what you need with intelligent search, advanced filters, and AI-powered document recommendations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                      <p className="text-gray-600">
                        Share insights, bookmark important documents, and collaborate with your team on regulatory matters.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:order-first">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">Enhanced AI Mode Active</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">💡 Ask about banking policies and regulations</p>
                      <div className="space-y-2">
                        <div className="bg-blue-100 px-3 py-2 rounded text-sm text-blue-700">What is FRY?</div>
                        <div className="bg-blue-100 px-3 py-2 rounded text-sm text-blue-700">Explain Basel III capital requirements</div>
                        <div className="bg-blue-100 px-3 py-2 rounded text-sm text-blue-700">What are CCAR stress testing requirements?</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                      <input 
                        type="text" 
                        placeholder="Ask about banking policies..." 
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled
                      />
                      <Button size="sm" disabled>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Regulatory Workflow?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of banking professionals who trust Re-Gent for their regulatory compliance needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/policy-qa">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4">
                  Start Exploring Policies
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/excel">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4">
                  Try Excel Analysis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
