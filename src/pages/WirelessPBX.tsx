import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Phone, 
  Users, 
  Shield, 
  Headphones, 
  Settings, 
  Clock,
  Building2,
  Hospital,
  GraduationCap,
  Store,
  Briefcase,
  Home,
  ChevronDown,
  PhoneCall,
  Video,
  FileText,
  Globe,
  Mic,
  UserCheck
} from "lucide-react";

const WirelessPBX = () => {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-2">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">›</span>
          <span>Mobile PBX</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/lovable-uploads/cebb0026-0cbe-451d-9fbc-90e7cc4ab8e9.png')`
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Dynamo Wireless Mobile PBX
          </h1>
          <p className="text-xl md:text-2xl mb-8 leading-relaxed">
            Transform your business communications with our cutting-edge Mobile PBX solution
          </p>
          <Button size="xl" className="bg-destructive hover:bg-destructive/90 text-white">
            Get Started Today
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-white animate-bounce" />
        </div>
      </section>

      {/* Section 1 - Introduction */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Revolutionary Mobile Communication
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Dynamo Wireless Mobile PBX represents the future of business communications. 
                Our advanced system seamlessly integrates traditional PBX functionality with 
                modern mobile technology, providing your business with unparalleled flexibility 
                and connectivity. Whether you're in the office, at home, or on the road, 
                stay connected with crystal-clear call quality and professional features.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Experience the power of 5G-enabled communication that scales with your business 
                needs and delivers enterprise-grade reliability.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-center text-white">
                <div className="text-6xl font-bold mb-4">5G</div>
                <div className="text-xl font-semibold mb-2">Powered Network</div>
                <div className="text-sm opacity-90">Ultra-fast, ultra-reliable communications</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Extended Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/lovable-uploads/f4415327-5a77-424f-b801-fa611a192866.png" 
                alt="Professional video calling"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Advanced Features for Modern Business
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Video className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">HD Video Conferencing</h3>
                    <p className="text-muted-foreground">Connect with teams and clients through crystal-clear video calls</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <FileText className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Call Recording & Analytics</h3>
                    <p className="text-muted-foreground">Comprehensive call recording with detailed analytics and reporting</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Headphones className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">24/7 Customer Support</h3>
                    <p className="text-muted-foreground">Round-the-clock technical support for uninterrupted service</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Hospital className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Healthcare Integration</h3>
                    <p className="text-muted-foreground">HIPAA-compliant communications for healthcare providers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Out of the Box Service */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Out of the Box Service Includes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to get started with professional mobile communications
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <Phone className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Unlimited Local & Long Distance</h3>
                <p className="text-muted-foreground">Call anywhere without restrictions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Multi-User Conference Calling</h3>
                <p className="text-muted-foreground">Host meetings with up to 50 participants</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Enterprise Security</h3>
                <p className="text-muted-foreground">Bank-level encryption and security protocols</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Custom Configuration</h3>
                <p className="text-muted-foreground">Tailored setup for your business needs</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Clock className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">24/7 Uptime Monitoring</h3>
                <p className="text-muted-foreground">Continuous system monitoring and maintenance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Mic className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Voicemail to Email</h3>
                <p className="text-muted-foreground">Receive voicemails directly in your inbox</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Usage Locations */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Dynamo Wireless Mobile-PBX can be used at:
            </h2>
            <p className="text-xl text-muted-foreground">
              Versatile communication solutions for every industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Building2, label: "Corporate Offices", description: "Enterprise communications" },
              { icon: Hospital, label: "Healthcare Facilities", description: "HIPAA-compliant systems" },
              { icon: GraduationCap, label: "Educational Institutions", description: "Campus-wide connectivity" },
              { icon: Store, label: "Retail Locations", description: "Multi-location coordination" },
              { icon: Briefcase, label: "Professional Services", description: "Client-focused communications" },
              { icon: Home, label: "Remote Workspaces", description: "Work-from-home solutions" }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-card rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <item.icon className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">{item.label}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - Call to Action */}
      <section className="py-20 bg-destructive">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Interested? Get a FREE Test Account!
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the power of Dynamo Wireless Mobile PBX with our risk-free trial
          </p>
          <Button 
            size="xl" 
            variant="secondary"
            className="bg-white text-destructive hover:bg-white/90"
            asChild
          >
            <Link to="/contact">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default WirelessPBX;