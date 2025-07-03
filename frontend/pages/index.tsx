import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { BookOpen, Brain, BarChart3, FileText, ArrowRight, Sparkles, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-blue-100 p-4 rounded-2xl mr-4">
                <Sparkles className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900">
                Re-Gent
              </h1>
            </div>
            <h2 className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
              Your AI-powered regulatory assistant for banking compliance and policy guidance
            </h2>
            
            {/* Main App Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Policy Q&A Card */}
              <Link href="/policy-qa">
                <Card className="group p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 h-72 flex flex-col">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-900 transition-colors">Policy Q&A</h3>
                  <p className="text-gray-600 mb-6 flex-grow leading-relaxed text-sm">
                    Ask questions about banking regulations and get AI-powered answers with source citations
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-medium text-sm shadow-md hover:shadow-lg transition-all">
                    Explore Policies
                    <BookOpen className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </Card>
              </Link>

              {/* Excel Analysis Card */}
              <Link href="/excel">
                <Card className="group p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 bg-white hover:bg-green-50/30 h-72 flex flex-col">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-green-900 transition-colors">Excel Analysis</h3>
                  <p className="text-gray-600 mb-6 flex-grow leading-relaxed text-sm">
                    Upload Excel files for AI-powered analysis, insights, and formula generation
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700 h-10 font-medium text-sm shadow-md hover:shadow-lg transition-all">
                    Analyze Excel Files
                    <BarChart3 className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </Card>
              </Link>

              {/* Document Analyzer Card */}
              <Link href="/document-analyzer">
                <Card className="group p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50/30 h-72 flex flex-col">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-purple-900 transition-colors">Document Analyzer</h3>
                  <p className="text-gray-600 mb-6 flex-grow leading-relaxed text-sm">
                    Upload PDF or Word documents to extract structure, headers, and generate insights
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 h-10 font-medium text-sm shadow-md hover:shadow-lg transition-all">
                    Analyze Documents
                    <FileText className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Simple Features */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-2xl font-semibold text-center mb-16 text-gray-900">
              Intelligent Banking Compliance Solutions
            </h3>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-3 text-lg text-gray-900">AI-Powered</h4>
                <p className="text-gray-600 leading-relaxed">Advanced AI understands regulatory context and provides accurate answers</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-3 text-lg text-gray-900">Compliance Focus</h4>
                <p className="text-gray-600 leading-relaxed">Built specifically for banking regulations and compliance requirements</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-3 text-lg text-gray-900">Comprehensive</h4>
                <p className="text-gray-600 leading-relaxed">Access to extensive regulatory documents and analysis tools</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
