import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, BookOpen, Zap, Users, ArrowRight, Star, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: "AI" | "Physics" | "Math";
  level: "Beginner" | "Intermediate" | "Advanced";
  students: number;
  rating: number;
  icon: React.ReactNode;
}

const courses: Course[] = [
  {
    id: "1",
    title: "How to Use AI",
    description: "Master the fundamentals of artificial intelligence and learn practical applications in everyday life.",
    category: "AI",
    level: "Beginner",
    students: 2450,
    rating: 4.8,
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "2",
    title: "Building with AI",
    description: "Learn to build intelligent applications and integrate AI models into your projects.",
    category: "AI",
    level: "Intermediate",
    students: 1820,
    rating: 4.9,
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "3",
    title: "Building Websites with AI",
    description: "Create modern, responsive websites enhanced with AI capabilities and automation.",
    category: "AI",
    level: "Intermediate",
    students: 1650,
    rating: 4.7,
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "4",
    title: "Classical Mechanics",
    description: "Explore the laws of motion, forces, and energy through interactive visualizations.",
    category: "Physics",
    level: "Beginner",
    students: 3200,
    rating: 4.9,
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: "5",
    title: "Electromagnetism",
    description: "Understand electric fields, magnetic forces, and electromagnetic waves with visual explanations.",
    category: "Physics",
    level: "Intermediate",
    students: 2100,
    rating: 4.8,
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: "6",
    title: "Quantum Physics",
    description: "Dive into the quantum world and understand the behavior of particles at atomic scales.",
    category: "Physics",
    level: "Advanced",
    students: 980,
    rating: 4.9,
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: "7",
    title: "Calculus Fundamentals",
    description: "Master derivatives, integrals, and limits with clear visual intuition.",
    category: "Math",
    level: "Beginner",
    students: 4100,
    rating: 4.9,
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    id: "8",
    title: "Linear Algebra",
    description: "Understand vectors, matrices, and transformations through animated visualizations.",
    category: "Math",
    level: "Intermediate",
    students: 2800,
    rating: 4.8,
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    id: "9",
    title: "Advanced Mathematics",
    description: "Explore differential equations, complex analysis, and advanced mathematical concepts.",
    category: "Math",
    level: "Advanced",
    students: 1450,
    rating: 4.9,
    icon: <TrendingUp className="w-6 h-6" />,
  },
];

const categories = [
  { name: "AI", color: "from-purple-500 to-pink-500", count: 3 },
  { name: "Physics", color: "from-blue-500 to-cyan-500", count: 3 },
  { name: "Math", color: "from-green-500 to-emerald-500", count: 3 },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<"AI" | "Physics" | "Math" | null>(null);

  const filteredCourses = selectedCategory
    ? courses.filter((course) => course.category === selectedCategory)
    : courses;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">PV</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Positron Vivek</h1>
              <p className="text-xs text-gray-500">Learn AI, Physics & Math</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")}>
                Email OTP Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20 md:py-32">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl">
                  <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    Master AI, Physics & Math
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                    Learn complex concepts through interactive visualizations, real-world applications, and expert-crafted content. Perfect for students, professionals, and lifelong learners.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="bg-white text-purple-900 hover:bg-gray-100"
                      onClick={() => navigate("/login")}
                    >
                      Login with Email OTP
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Explore Courses
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">50K+</div>
                    <p className="text-gray-600">Active Students</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">150+</div>
                    <p className="text-gray-600">Expert Courses</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-pink-600 mb-2">4.9/5</div>
                    <p className="text-gray-600">Average Rating</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Categories Section */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h3 className="text-3xl font-bold mb-12 text-center">Learning Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category.name ? null : (category.name as "AI" | "Physics" | "Math")
                        )
                      }
                      className={`p-8 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === category.name
                          ? `bg-gradient-to-br ${category.color} text-white shadow-lg`
                          : `bg-gradient-to-br ${category.color} text-white shadow-md hover:shadow-lg opacity-80 hover:opacity-100`
                      }`}
                    >
                      <h4 className="text-2xl font-bold mb-2">{category.name}</h4>
                      <p className="text-sm opacity-90">{category.count} Courses</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Courses Grid Section */}
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="mb-12">
                  <h3 className="text-3xl font-bold mb-4">
                    {selectedCategory ? `${selectedCategory} Courses` : "All Courses"}
                  </h3>
                  <p className="text-gray-600">
                    {filteredCourses.length} courses available
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="ml-4 text-blue-600 hover:text-blue-700 underline"
                      >
                        View All
                      </button>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                      onClick={() => {
                        if (isAuthenticated) {
                          // Navigate to course details
                        } else {
                          navigate("/login");
                        }
                      }}
                    >
                      <div
                        className={`h-32 bg-gradient-to-br ${
                          course.category === "AI"
                            ? "from-purple-500 to-pink-500"
                            : course.category === "Physics"
                              ? "from-blue-500 to-cyan-500"
                              : "from-green-500 to-emerald-500"
                        } flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                      >
                        <div className="text-white opacity-80">{course.icon}</div>
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                            <CardDescription className="mt-1">{course.category}</CardDescription>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                            {course.level}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-semibold">{course.rating}</span>
                          </div>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {(course.students / 1000).toFixed(1)}K
                          </span>
                        </div>

                        <Button
                          className="w-full mt-4 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAuthenticated) {
                              // Navigate to course
                            } else {
                              navigate("/login");
                            }
                          }}
                        >
                          <Play className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                          {isAuthenticated ? "Start Course" : "Sign In to Start"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h3 className="text-3xl font-bold mb-12 text-center">Why Choose Positron Vivek?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-bold mb-2">Interactive Learning</h4>
                    <p className="text-sm text-gray-600">
                      Visualizations and interactive tools to understand complex concepts
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-bold mb-2">Expert Instructors</h4>
                    <p className="text-sm text-gray-600">
                      Learn from experienced educators passionate about teaching
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-bold mb-2">Comprehensive Content</h4>
                    <p className="text-sm text-gray-600">
                      From basics to advanced topics with structured learning paths
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-pink-600" />
                    </div>
                    <h4 className="font-bold mb-2">AI-Enhanced Learning</h4>
                    <p className="text-sm text-gray-600">
                      Personalized recommendations and AI-powered assistance
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
              <div className="container mx-auto px-4 text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Learning?</h3>
                <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                  Join thousands of students already learning on Positron Vivek. Sign up today and get access to all courses.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => navigate("/login")}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <h4 className="text-white font-bold mb-4">Positron Vivek</h4>
                    <p className="text-sm">
                      Making education accessible and engaging for everyone.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4">Courses</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="hover:text-white">AI Courses</a></li>
                      <li><a href="#" className="hover:text-white">Physics Courses</a></li>
                      <li><a href="#" className="hover:text-white">Math Courses</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4">Company</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="hover:text-white">About Us</a></li>
                      <li><a href="#" className="hover:text-white">Contact</a></li>
                      <li><a href="#" className="hover:text-white">Blog</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="hover:text-white">Privacy</a></li>
                      <li><a href="#" className="hover:text-white">Terms</a></li>
                      <li><a href="#" className="hover:text-white">Support</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-sm">
                  <p>&copy; 2026 Positron Vivek. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
