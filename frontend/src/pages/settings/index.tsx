import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, Save, Loader2, Upload, Image, FileImage, Mail, MapPin, Github, Twitter, Linkedin, Instagram, Globe, Search, FileText, Tag } from "lucide-react";
import { settingsApi } from "@/lib/api";

// Get base URL without /api suffix
const getBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  return apiUrl.replace(/\/api$/, '');
};
const BASE_URL = getBaseUrl();

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appName, setAppName] = useState("StarterKits");
  const [appSubtitle, setAppSubtitle] = useState("Hospital System");
  const [appLogo, setAppLogo] = useState("");
  const [appFavicon, setAppFavicon] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [fetching, setFetching] = useState(true);
  // Contact & Social
  const [contactEmail, setContactEmail] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [contactLocationDetail, setContactLocationDetail] = useState("");
  const [socialGithub, setSocialGithub] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  // Homepage SEO
  const [homeMetaTitle, setHomeMetaTitle] = useState("");
  const [homeMetaDescription, setHomeMetaDescription] = useState("");
  const [homeMetaKeywords, setHomeMetaKeywords] = useState("");
  const [homeOgImage, setHomeOgImage] = useState("");
  const [homeHeroTitle, setHomeHeroTitle] = useState("");
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState("");
  const [homeHeroDescription, setHomeHeroDescription] = useState("");
  const [homeHeroBadge, setHomeHeroBadge] = useState("");
  const [savingHomeSEO, setSavingHomeSEO] = useState(false);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  // Set page title
  useEffect(() => {
    const savedAppName = localStorage.getItem("appName") || "StarterKits";
    document.title = `Settings - ${savedAppName}`;
  }, []);

  // Load settings from API and localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load from API
      const response = await settingsApi.getAll();
      const settings = response.data.data;

      if (settings.app_name) { setAppName(settings.app_name); localStorage.setItem("appName", settings.app_name); }
      if (settings.app_subtitle) { setAppSubtitle(settings.app_subtitle); localStorage.setItem("appSubtitle", settings.app_subtitle); }
      if (settings.app_logo) { setAppLogo(settings.app_logo); localStorage.setItem("appLogo", settings.app_logo); }
      if (settings.app_favicon) {
        setAppFavicon(settings.app_favicon);
        localStorage.setItem("appFavicon", settings.app_favicon);
        updateFavicon(settings.app_favicon);
      }
      // Contact & Social
      if (settings.contact_email) setContactEmail(settings.contact_email);
      if (settings.contact_location) setContactLocation(settings.contact_location);
      if (settings.contact_location_detail) setContactLocationDetail(settings.contact_location_detail);
      if (settings.social_github) setSocialGithub(settings.social_github);
      if (settings.social_twitter) setSocialTwitter(settings.social_twitter);
      if (settings.social_linkedin) setSocialLinkedin(settings.social_linkedin);
      if (settings.social_instagram) setSocialInstagram(settings.social_instagram);
      // Homepage SEO
      if (settings.home_meta_title) setHomeMetaTitle(settings.home_meta_title);
      if (settings.home_meta_description) setHomeMetaDescription(settings.home_meta_description);
      if (settings.home_meta_keywords) setHomeMetaKeywords(settings.home_meta_keywords);
      if (settings.home_og_image) setHomeOgImage(settings.home_og_image);
      if (settings.home_hero_title) setHomeHeroTitle(settings.home_hero_title);
      if (settings.home_hero_subtitle) setHomeHeroSubtitle(settings.home_hero_subtitle);
      if (settings.home_hero_description) setHomeHeroDescription(settings.home_hero_description);
      if (settings.home_hero_badge) setHomeHeroBadge(settings.home_hero_badge);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setFetching(false);
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    const fullUrl = faviconUrl.startsWith('http') ? faviconUrl : `${BASE_URL}${faviconUrl}`;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = fullUrl;
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const response = await settingsApi.uploadLogo(file, 'logo');
      const url = response.data.url;
      setAppLogo(url);
      localStorage.setItem("appLogo", url);
      window.dispatchEvent(new Event("storage"));
      
      toast({
        variant: "success",
        title: "Success!",
        description: "Logo uploaded successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to upload logo.",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const response = await settingsApi.uploadLogo(file, 'favicon');
      const url = response.data.url;
      setAppFavicon(url);
      localStorage.setItem("appFavicon", url);
      updateFavicon(url);
      
      toast({
        variant: "success",
        title: "Success!",
        description: "Favicon uploaded successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to upload favicon.",
      });
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleSaveAppSettings = async () => {
    setLoading(true);
    try {
      // Save to API
      await settingsApi.update({
        app_name: appName,
        app_subtitle: appSubtitle,
      });

      // Save to localStorage
      localStorage.setItem("appName", appName);
      localStorage.setItem("appSubtitle", appSubtitle);

      // Trigger storage event to update sidebar immediately
      window.dispatchEvent(new Event("storage"));

      toast({
        variant: "success",
        title: "Success!",
        description: "Application settings saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to save settings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadOgImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingOgImage(true);
    try {
      const response = await settingsApi.uploadLogo(file, 'og-image');
      const url = response.data.url;
      setHomeOgImage(url);
      toast({ variant: "success", title: "Success!", description: "OG image uploaded." });
    } catch {
      toast({ variant: "destructive", title: "Error!", description: "Failed to upload OG image." });
    } finally {
      setUploadingOgImage(false);
    }
  };

  const handleSaveHomeSEO = async () => {
    setSavingHomeSEO(true);
    try {
      await settingsApi.update({
        home_meta_title: homeMetaTitle,
        home_meta_description: homeMetaDescription,
        home_meta_keywords: homeMetaKeywords,
        home_og_image: homeOgImage,
        home_hero_title: homeHeroTitle,
        home_hero_subtitle: homeHeroSubtitle,
        home_hero_description: homeHeroDescription,
        home_hero_badge: homeHeroBadge,
      });
      toast({ variant: "success", title: "Saved!", description: "Homepage SEO settings updated." });
    } catch {
      toast({ variant: "destructive", title: "Error!", description: "Failed to save homepage SEO settings." });
    } finally {
      setSavingHomeSEO(false);
    }
  };

  const handleSaveContactSettings = async () => {
    setSavingContact(true);
    try {
      await settingsApi.update({
        contact_email: contactEmail,
        contact_location: contactLocation,
        contact_location_detail: contactLocationDetail,
        social_github: socialGithub,
        social_twitter: socialTwitter,
        social_linkedin: socialLinkedin,
        social_instagram: socialInstagram,
      });
      toast({ variant: "success", title: "Saved!", description: "Contact & social settings updated." });
    } catch {
      toast({ variant: "destructive", title: "Error!", description: "Failed to save contact settings." });
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 max-w-full">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage application preferences
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-full">
        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Application Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Application
                </CardTitle>
                <CardDescription>
                  Customize application name and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="appName"
                      className="text-xs font-medium flex items-center gap-2"
                    >
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Application Name
                    </Label>
                    <Input
                      id="appName"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="StarterKits"
                      className="max-w-md"
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will appear in the sidebar and page titles
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="appSubtitle"
                      className="text-xs font-medium flex items-center gap-2"
                    >
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Application Subtitle
                    </Label>
                    <Input
                      id="appSubtitle"
                      value={appSubtitle}
                      onChange={(e) => setAppSubtitle(e.target.value)}
                      placeholder="Hospital System"
                      className="max-w-md"
                    />
                    <p className="text-xs text-muted-foreground">
                      Subtitle text shown below the application name
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveAppSettings}
                    className="mt-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Branding Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Branding
                </CardTitle>
                <CardDescription>
                  Upload application logo and favicon
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      <Image className="h-3.5 w-3.5 text-muted-foreground" />
                      Application Logo
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                        {appLogo ? (
                          <img 
                            src={`${BASE_URL}${appLogo}`} 
                            alt="Logo" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={handleUploadLogo}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Logo
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, or SVG. Max 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      <FileImage className="h-3.5 w-3.5 text-muted-foreground" />
                      Favicon
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                        {appFavicon ? (
                          <img 
                            src={`${BASE_URL}${appFavicon}`} 
                            alt="Favicon" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <FileImage className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          ref={faviconInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/x-icon,image/ico"
                          onChange={handleUploadFavicon}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => faviconInputRef.current?.click()}
                          disabled={uploadingFavicon}
                        >
                          {uploadingFavicon ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Favicon
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          ICO, PNG, or JPG. 32x32 or 64x64 recommended.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Social Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Contact &amp; Social Media</CardTitle>
                <CardDescription>
                  Configure contact info and social links displayed on the blog&apos;s contact page
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-xs font-medium flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Contact Email
                      </Label>
                      <Input id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactLocation" className="text-xs font-medium flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Location
                      </Label>
                      <Input id="contactLocation" value={contactLocation} onChange={(e) => setContactLocation(e.target.value)} placeholder="Indonesia" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="contactLocationDetail" className="text-xs font-medium flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Location Detail
                      </Label>
                      <Input id="contactLocationDetail" value={contactLocationDetail} onChange={(e) => setContactLocationDetail(e.target.value)} placeholder="Available Worldwide" />
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-3">Social Media URLs</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="socialGithub" className="text-xs font-medium flex items-center gap-2">
                          <Github className="h-3.5 w-3.5 text-muted-foreground" /> GitHub
                        </Label>
                        <Input id="socialGithub" value={socialGithub} onChange={(e) => setSocialGithub(e.target.value)} placeholder="https://github.com/username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialTwitter" className="text-xs font-medium flex items-center gap-2">
                          <Twitter className="h-3.5 w-3.5 text-muted-foreground" /> Twitter / X
                        </Label>
                        <Input id="socialTwitter" value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} placeholder="https://twitter.com/username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialLinkedin" className="text-xs font-medium flex items-center gap-2">
                          <Linkedin className="h-3.5 w-3.5 text-muted-foreground" /> LinkedIn
                        </Label>
                        <Input id="socialLinkedin" value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialInstagram" className="text-xs font-medium flex items-center gap-2">
                          <Instagram className="h-3.5 w-3.5 text-muted-foreground" /> Instagram
                        </Label>
                        <Input id="socialInstagram" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/username" />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveContactSettings} className="mt-2" disabled={savingContact}>
                    {savingContact ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2" />Save Contact Settings</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Homepage SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Homepage SEO &amp; Hero</CardTitle>
                <CardDescription>
                  Meta tags, Open Graph image, and hero section content for the blog homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* SEO Meta */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2"><Search className="h-3.5 w-3.5" />SEO Meta Tags</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="homeMetaTitle" className="text-xs font-medium">Meta Title</Label>
                        <Input id="homeMetaTitle" value={homeMetaTitle} onChange={(e) => setHomeMetaTitle(e.target.value)} placeholder="Blog & Portfolio | Your Name" className="max-w-xl" />
                        <p className="text-xs text-muted-foreground">Recommended: 50–60 characters. Falls back to app name.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="homeMetaDesc" className="text-xs font-medium">Meta Description</Label>
                        <textarea id="homeMetaDesc" value={homeMetaDescription} onChange={(e) => setHomeMetaDescription(e.target.value)} placeholder="A short description of your blog for search engines..." rows={3} className="flex w-full max-w-xl rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                        <p className="text-xs text-muted-foreground">Recommended: 120–160 characters.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="homeMetaKw" className="text-xs font-medium flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-muted-foreground" />Meta Keywords</Label>
                        <Input id="homeMetaKw" value={homeMetaKeywords} onChange={(e) => setHomeMetaKeywords(e.target.value)} placeholder="blog, portfolio, developer, nextjs" className="max-w-xl" />
                        <p className="text-xs text-muted-foreground">Comma-separated keywords.</p>
                      </div>
                    </div>
                  </div>

                  {/* OG Image */}
                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2"><Globe className="h-3.5 w-3.5" />Open Graph / Social Share Image</p>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-20 border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                        {homeOgImage ? (
                          <img src={`${BASE_URL}${homeOgImage}`} alt="OG" className="w-full h-full object-cover" />
                        ) : (
                          <Globe className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <input ref={ogImageInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleUploadOgImage} className="hidden" />
                        <Button variant="outline" size="sm" onClick={() => ogImageInputRef.current?.click()} disabled={uploadingOgImage}>
                          {uploadingOgImage ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="h-4 w-4 mr-2" />Upload OG Image</>}
                        </Button>
                        <p className="text-xs text-muted-foreground">PNG or JPG. 1200×630px recommended.</p>
                      </div>
                    </div>
                  </div>

                  {/* Hero Section */}
                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2"><FileText className="h-3.5 w-3.5" />Hero Section Content</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="homeHeroBadge" className="text-xs font-medium">Badge Text</Label>
                        <Input id="homeHeroBadge" value={homeHeroBadge} onChange={(e) => setHomeHeroBadge(e.target.value)} placeholder="Available for freelance work" />
                        <p className="text-xs text-muted-foreground">Small badge shown above hero title.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="homeHeroTitle" className="text-xs font-medium">Hero Title</Label>
                        <Input id="homeHeroTitle" value={homeHeroTitle} onChange={(e) => setHomeHeroTitle(e.target.value)} placeholder="Crafting Digital\nExperiences" />
                        <p className="text-xs text-muted-foreground">Use \n for line break.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="homeHeroSubtitle" className="text-xs font-medium">Hero Subtitle</Label>
                        <Input id="homeHeroSubtitle" value={homeHeroSubtitle} onChange={(e) => setHomeHeroSubtitle(e.target.value)} placeholder="Full-Stack Developer" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="homeHeroDesc" className="text-xs font-medium">Hero Description</Label>
                        <textarea id="homeHeroDesc" value={homeHeroDescription} onChange={(e) => setHomeHeroDescription(e.target.value)} placeholder="Sharing my journey in software development..." rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveHomeSEO} className="mt-2" disabled={savingHomeSEO}>
                    {savingHomeSEO ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Homepage Settings</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
