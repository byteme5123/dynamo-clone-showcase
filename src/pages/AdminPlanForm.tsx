
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageUpload } from '@/components/ImageUpload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().default('USD'),
  plan_type: z.enum(['domestic', 'special']),
  data_limit: z.string().optional(),
  call_minutes: z.string().optional(),
  sms_limit: z.string().optional(),
  validity_days: z.number().optional(),
  countries: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  display_order: z.number().default(0),
  image_url: z.string().optional(),
  external_link: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

const AdminPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [newFeature, setNewFeature] = useState('');
  const [newCountry, setNewCountry] = useState('');

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      currency: 'USD',
      plan_type: 'domestic',
      data_limit: '',
      call_minutes: '',
      sms_limit: '',
      validity_days: 30,
      countries: [],
      features: [],
      is_active: true,
      is_featured: false,
      display_order: 0,
      image_url: '',
    },
  });

  const { watch, setValue } = form;
  const watchedFeatures = watch('features') || [];
  const watchedCountries = watch('countries') || [];

  // Load plan data if editing
  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (plan) {
      // Safely convert Json types to string arrays
      const safeFeatures = Array.isArray(plan.features) 
        ? plan.features.filter((f): f is string => typeof f === 'string')
        : [];
      
      const safeCountries = Array.isArray(plan.countries) 
        ? plan.countries.filter((c): c is string => typeof c === 'string')
        : [];

      form.reset({
        name: plan.name,
        slug: plan.slug,
        description: plan.description || '',
        price: plan.price,
        currency: plan.currency,
        plan_type: plan.plan_type as 'domestic' | 'special',
        data_limit: plan.data_limit || '',
        call_minutes: plan.call_minutes || '',
        sms_limit: plan.sms_limit || '',
        validity_days: plan.validity_days,
        countries: safeCountries,
        features: safeFeatures,
        is_active: plan.is_active,
        is_featured: plan.is_featured,
        display_order: plan.display_order,
        image_url: plan.image_url || '',
        external_link: plan.external_link || '',
      });
    }
  }, [plan, form]);

  const savePlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      // Convert form data to database format
      const dbData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        currency: data.currency,
        plan_type: data.plan_type,
        data_limit: data.data_limit,
        call_minutes: data.call_minutes,
        sms_limit: data.sms_limit,
        validity_days: data.validity_days,
        countries: data.countries || [],
        features: data.features || [], // This will be converted to jsonb by Supabase
        is_active: data.is_active,
        is_featured: data.is_featured,
        display_order: data.display_order,
        image_url: data.image_url,
        external_link: data.external_link,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('plans')
          .update(dbData)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('plans')
          .insert(dbData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast({
        title: 'Success',
        description: `Plan ${isEditing ? 'updated' : 'created'} successfully`,
      });
      navigate('/admin/plans');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} plan`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PlanFormData) => {
    savePlanMutation.mutate(data);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setValue('features', [...watchedFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setValue('features', watchedFeatures.filter((_, i) => i !== index));
  };

  const addCountry = () => {
    if (newCountry.trim()) {
      setValue('countries', [...watchedCountries, newCountry.trim()]);
      setNewCountry('');
    }
  };

  const removeCountry = (index: number) => {
    setValue('countries', watchedCountries.filter((_, i) => i !== index));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link to="/admin/plans">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Plan' : 'Add New Plan'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update plan details' : 'Create a new mobile plan'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter plan name"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!isEditing) {
                              setValue('slug', generateSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="plan-slug" />
                      </FormControl>
                      <FormDescription>
                        URL-friendly version of the plan name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Plan description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="plan_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="domestic">Domestic</SelectItem>
                          <SelectItem value="special">Special</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="data_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Limit</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 10GB, Unlimited" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="call_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Minutes</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 500 minutes, Unlimited" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sms_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMS Limit</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 1000 SMS, Unlimited" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validity_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validity (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                  <FormField
                    control={form.control}
                    name="display_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Lower numbers appear first
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                   )}
                 />

                 <FormField
                   control={form.control}
                   name="external_link"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>External Link</FormLabel>
                       <FormControl>
                         <Input {...field} placeholder="https://example.com/signup" />
                       </FormControl>
                       <FormDescription>
                         External URL for the "Choose this plan" button
                       </FormDescription>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </CardContent>
             </Card>

             <Card>
               <CardHeader>
                 <CardTitle>Plan Image</CardTitle>
               </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan Image</FormLabel>
                          <FormControl>
                            <ImageUpload
                              bucket="plan-images"
                              onUploadComplete={field.onChange}
                              existingImage={field.value}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload an image for this plan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Active</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Featured</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {watchedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Countries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    placeholder="Add a country"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCountry())}
                  />
                  <Button type="button" onClick={addCountry}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {watchedCountries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{country}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCountry(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/plans">Cancel</Link>
            </Button>
            <Button type="submit" disabled={savePlanMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {savePlanMutation.isPending ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdminPlanForm;
