import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, Mail, MessageCircle, ArrowLeft, ArrowRight, Check, CreditCard, Smartphone, Wifi } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  areaCode: z.string().min(3, 'Area code is required'),
  simNumber: z.string().min(10, 'SIM number is required'),
  isESim: z.string(),
  orderNumber: z.string().min(1, 'Order number is required'),
  portNumber: z.string(),
});

const portInfoSchema = z.object({
  carrierProvider: z.string().min(1, 'Carrier provider is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  pinNumber: z.string().min(1, 'PIN number is required'),
  telephoneNumber: z.string().min(10, 'Telephone number is required'),
});

type PersonalInfoData = z.infer<typeof personalInfoSchema>;
type PortInfoData = z.infer<typeof portInfoSchema>;

const ActivateSIM = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData | null>(null);
  const [portInfo, setPortInfo] = useState<PortInfoData | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();

  const personalForm = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: '',
      email: '',
      areaCode: '',
      simNumber: '',
      isESim: 'no',
      orderNumber: '',
      portNumber: 'no',
    },
  });

  const portForm = useForm<PortInfoData>({
    resolver: zodResolver(portInfoSchema),
    defaultValues: {
      carrierProvider: '',
      accountNumber: '',
      pinNumber: '',
      telephoneNumber: '',
    },
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: <Smartphone className="w-4 h-4" /> },
    { number: 2, title: 'Port Info', icon: <Wifi className="w-4 h-4" /> },
    { number: 3, title: 'Review', icon: <Check className="w-4 h-4" /> },
    { number: 4, title: 'Confirmation', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const carriers = [
    'Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Cricket', 'Boost Mobile', 
    'Metro PCS', 'Straight Talk', 'TracFone', 'Mint Mobile', 'Other'
  ];

  const onPersonalInfoSubmit = (data: PersonalInfoData) => {
    setPersonalInfo(data);
    if (data.portNumber === 'yes') {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
    }
  };

  const onPortInfoSubmit = (data: PortInfoData) => {
    setPortInfo(data);
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!isConfirmed) {
      toast({
        title: "Please confirm",
        description: "You must confirm the information is accurate",
        variant: "destructive"
      });
      return;
    }

    if (!personalInfo) return;

    try {
      const { error } = await supabase
        .from('activate_sim_requests')
        .insert({
          full_name: personalInfo.fullName,
          email: personalInfo.email,
          phone_number: personalInfo.areaCode,
          sim_card_number: personalInfo.simNumber,
          plan_preference: portInfo?.carrierProvider || null,
          additional_notes: portInfo ? 
            `Port from ${portInfo.carrierProvider}\nAccount: ${portInfo.accountNumber}\nPhone: ${portInfo.telephoneNumber}` : 
            null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Activation submitted!",
        description: "Your SIM activation request has been received.",
      });
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error submitting activation:', error);
      toast({
        title: "Error",
        description: "Failed to submit activation request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const progressPercentage = ((currentStep - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center space-x-2 cursor-pointer ${
                  step.number <= currentStep
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
                onClick={() => goToStep(step.number)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step.number <= currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground'
                  }`}
                >
                  {step.number < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="hidden md:block font-medium">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Instructions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Make sure you have your SIM card and order number ready.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    If transferring your number, gather your current carrier details.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    For help, call 1-877-648-7989 or email support@dynamowireless.com.
                  </p>
                </div>
                
                {currentStep === 2 && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">SIM Card Location</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Find your ICCID and IMEI numbers on your SIM card packaging.
                      </p>
                      <div className="bg-card border-2 border-dashed border-border p-4 rounded text-center">
                        <CreditCard className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          SIM Card with barcode
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Step {currentStep}: {steps[currentStep - 1]?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <Form {...personalForm}>
                    <form onSubmit={personalForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-6">
                      <FormField
                        control={personalForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="areaCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area Code</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 555" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="simNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SIM Number (ICCID)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your SIM number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="isESim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Applying for eSIM?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="orderNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your order number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="portNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Port Number from existing carrier?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </Form>
                )}

                {/* Step 2: Port Info */}
                {currentStep === 2 && (
                  <Form {...portForm}>
                    <form onSubmit={portForm.handleSubmit(onPortInfoSubmit)} className="space-y-6">
                      <FormField
                        control={portForm.control}
                        name="carrierProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Carrier Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your carrier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {carriers.map((carrier) => (
                                  <SelectItem key={carrier} value={carrier.toLowerCase()}>
                                    {carrier}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={portForm.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={portForm.control}
                        name="pinNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIN Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your PIN" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={portForm.control}
                        name="telephoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telephone Number to Port</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setCurrentStep(1)}
                          className="flex-1"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <Button type="submit" className="flex-1">
                          Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Step 3: Review & Confirm */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Review Your Information</h3>
                      
                      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Personal Information</span>
                          <Button 
                            variant="link" 
                            onClick={() => setCurrentStep(1)}
                            className="text-primary p-0 h-auto"
                          >
                            Edit
                          </Button>
                        </div>
                        {personalInfo && (
                          <div className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {personalInfo.fullName}</p>
                            <p><strong>Area Code:</strong> {personalInfo.areaCode}</p>
                            <p><strong>SIM Number:</strong> {personalInfo.simNumber}</p>
                            <p><strong>eSIM:</strong> {personalInfo.isESim === 'yes' ? 'Yes' : 'No'}</p>
                            <p><strong>Order Number:</strong> {personalInfo.orderNumber}</p>
                            <p><strong>Port Number:</strong> {personalInfo.portNumber === 'yes' ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                      </div>

                      {personalInfo?.portNumber === 'yes' && portInfo && (
                        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Port Information</span>
                            <Button 
                              variant="link" 
                              onClick={() => setCurrentStep(2)}
                              className="text-primary p-0 h-auto"
                            >
                              Edit
                            </Button>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Carrier:</strong> {portInfo.carrierProvider}</p>
                            <p><strong>Account Number:</strong> {portInfo.accountNumber}</p>
                            <p><strong>PIN:</strong> {portInfo.pinNumber}</p>
                            <p><strong>Phone Number:</strong> {portInfo.telephoneNumber}</p>
                          </div>
                        </div>
                      )}

                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          By activating, you agree to our Terms & Conditions and acknowledge that 5G/4G LTE service availability varies by location.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="confirm"
                            checked={isConfirmed}
                            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                          />
                          <label htmlFor="confirm" className="text-sm font-medium">
                            I confirm the information above is accurate
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep(personalInfo?.portNumber === 'yes' ? 2 : 1)}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button 
                        onClick={handleFinalSubmit}
                        className="flex-1"
                        disabled={!isConfirmed}
                      >
                        Submit Activation
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                      <p className="text-muted-foreground mb-4">
                        Your request to activate your SIM has been received.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive a confirmation within 24 hours.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild className="flex-1">
                        <a href="/">Return to Homepage</a>
                      </Button>
                      <Button variant="outline" asChild className="flex-1">
                        <a href="/plans">Shop Plans</a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Customer Support Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Call us</p>
                  <p className="text-sm text-muted-foreground">+1 877 648 7989</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Email us</p>
                  <p className="text-sm text-muted-foreground">support@dynamowireless.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <Button variant="outline" size="sm">
                  Chat with Executive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ActivateSIM;