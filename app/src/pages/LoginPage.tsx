import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pill, 
  FlaskConical, 
  Microscope, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  Sparkles,
  Atom,
  Loader2
} from 'lucide-react';
import gsap from 'gsap';

interface LoginPageProps {
  onRegister: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onLoginSubmit: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export const LoginPage = ({ onRegister, onLoginSubmit }: LoginPageProps) => {
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.gradient-bg', {
        backgroundPosition: '200% 200%',
        duration: 15,
        repeat: -1,
        ease: 'none'
      });
      
      gsap.fromTo(
        cardRef.current,
        { y: 80, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
      );
    }, heroRef);
    
    return () => ctx.revert();
  }, []);

  const validateSignup = () => {
    const errors: Record<string, string> = {};
    
    if (!signupName.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!signupEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!signupPassword) {
      errors.password = 'Password is required';
    } else if (signupPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (signupPassword !== signupConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter email and password');
      return;
    }
    
    setIsLoggingIn(true);
    const result = await onLoginSubmit(loginEmail, loginPassword);
    setIsLoggingIn(false);
    
    if (!result.success) {
      setLoginError(result.error || 'Invalid email or password');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    
    if (!validateSignup()) return;
    
    setIsSigningUp(true);
    const result = await onRegister(signupName, signupEmail, signupPassword);
    setIsSigningUp(false);
    
    if (!result.success) {
      setSignupErrors({ general: result.error || 'Registration failed' });
    }
  };

  return (
    <div 
      ref={heroRef}
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8"
    >
      {/* Animated gradient background */}
      <div 
        className="gradient-bg absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          backgroundSize: '400% 400%',
        }}
      />
      
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-24 h-12 bg-white/20 rounded-full backdrop-blur-md border border-white/30 flex items-center justify-center animate-pulse">
          <Pill className="w-8 h-8 text-white/80" />
        </div>
        <div className="absolute top-[15%] right-[8%] w-20 h-20 bg-white/15 rounded-2xl backdrop-blur-md border border-white/30 flex items-center justify-center rotate-12">
          <FlaskConical className="w-10 h-10 text-white/80" />
        </div>
        <div className="absolute bottom-[20%] left-[10%] w-16 h-16 bg-white/20 rounded-full backdrop-blur-md border border-white/30 flex items-center justify-center">
          <Microscope className="w-7 h-7 text-white/80" />
        </div>
        <div className="absolute bottom-[15%] right-[5%] w-28 h-14 bg-white/15 rounded-full backdrop-blur-md border border-white/30 flex items-center justify-center -rotate-6">
          <Atom className="w-10 h-10 text-white/80" />
        </div>
      </div>

      {/* Main card */}
      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.3)] border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                <div className="relative">
                  <Pill className="w-10 h-10 text-white" />
                  <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">PharmaStudy</h1>
              <p className="text-white/80 text-sm">Master molecules. One card at a time.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-full">
                <TabsTrigger 
                  value="login" 
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#667eea] data-[state=active]:to-[#764ba2] data-[state=active]:text-white"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#667eea] data-[state=active]:to-[#764ba2] data-[state=active]:text-white"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-5">
                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {loginError}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#667eea]" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#667eea]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-700 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#667eea]" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#667eea] pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full h-12 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd6] hover:to-[#6a4190] text-white rounded-xl font-semibold"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupErrors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {signupErrors.general}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-[#667eea]" />
                      Full Name
                    </Label>
                    <Input
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      className={`h-12 rounded-xl border-2 ${signupErrors.name ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {signupErrors.name && <p className="text-red-500 text-xs">{signupErrors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#667eea]" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`h-12 rounded-xl border-2 ${signupErrors.email ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {signupErrors.email && <p className="text-red-500 text-xs">{signupErrors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#667eea]" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className={`h-12 rounded-xl border-2 pr-12 ${signupErrors.password ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {signupErrors.password && <p className="text-red-500 text-xs">{signupErrors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#667eea]" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className={`h-12 rounded-xl border-2 pr-12 ${signupErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && <p className="text-red-500 text-xs">{signupErrors.confirmPassword}</p>}
                  </div>

                  <div className="flex items-start gap-2">
                    <input type="checkbox" required className="mt-1 rounded" />
                    <label className="text-sm text-gray-600">
                      I agree to the Terms and Privacy Policy
                    </label>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSigningUp}
                    className="w-full h-12 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl font-semibold"
                  >
                    {isSigningUp ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
