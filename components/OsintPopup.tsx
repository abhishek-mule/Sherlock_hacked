import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, BookOpen, Briefcase, Building, ExternalLink, Globe, Linkedin, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";

interface OsintPopupProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function OsintPopup({ isOpen, onClose, email }: OsintPopupProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (isOpen && email) {
      fetchProfileData(email);
    }
  }, [isOpen, email]);

  const fetchProfileData = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/osint/enrichment?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error("Failed to fetch OSINT data:", err);
      setError(err.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Handle the data structure from People Data Labs API
  const person = data?.data || data || {};
  const work = person.work?.[0] || {};
  const company = work.company || {};
  const education = person.education?.[0] || {};
  const location = person.location || {};

  // Loading state UI
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Loading Profile Data</DialogTitle>
            <DialogDescription>Retrieving information for {email}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state UI
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle size={18} />
              Error Loading Profile
            </DialogTitle>
            <DialogDescription>
              We encountered a problem while retrieving information for {email}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            {error}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-white mx-auto sm:mx-0">
              {person.profile_pic_url ? (
                <AvatarImage src={person.profile_pic_url} alt={person.full_name || email} />
              ) : (
                <AvatarFallback className="bg-teal-700 text-xl font-bold">
                  {(person.full_name || email)[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold">{person.full_name || email.split('@')[0]}</h2>
              <p className="text-white/90">{work.title || 'Professional'}</p>
              {(location.name || company.location) && (
                <div className="flex items-center gap-1 text-sm mt-1 text-white/80 justify-center sm:justify-start">
                  <MapPin size={14} />
                  <span>{location.name || company.location}</span>
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                {company.name && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">{company.name}</Badge>
                )}
                {education.school?.name && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">{education.school.name}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <div className="px-4 border-b">
            <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0 gap-2">
              <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:shadow-none rounded-none h-full bg-transparent">
                Profile
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:shadow-none rounded-none h-full bg-transparent">
                Contact
              </TabsTrigger>
              <TabsTrigger value="education" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:shadow-none rounded-none h-full bg-transparent">
                Education
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 max-h-[400px]">
            <TabsContent value="profile" className="m-0 p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  About
                </h3>
                <p className="text-muted-foreground">
                  {person.bio || `Professional profile for ${person.full_name || email.split('@')[0]}.`}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  Experience
                </h3>
                
                {person.work && person.work.length > 0 ? (
                  <div className="space-y-3">
                    {person.work.map((job: any, index: number) => (
                      <Card key={index} className="border">
                        <CardHeader className="p-3 pb-2">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-muted flex items-center justify-center rounded">
                              <Building className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-sm sm:text-base">{job.title}</CardTitle>
                              <CardDescription className="text-xs sm:text-sm">
                                {job.company?.name}
                                {job.company?.location && ` · ${job.company.location}`}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {job.start_date && (
                              <div>
                                {job.start_date} - {job.end_date || 'Present'}
                                {job.is_current && ' (Current)'}
                              </div>
                            )}
                            {job.company?.industry && (
                              <div className="mt-1">Industry: {job.company.industry}</div>
                            )}
                          </div>
                          {job.company?.website && (
                            <a 
                              href={job.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm text-teal-600 hover:underline flex items-center gap-1 mt-2"
                            >
                              <Globe className="h-3 w-3" />
                              Company Website
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground text-sm">No work experience available</p>
                  </div>
                )}
              </div>

              {person.skills && person.skills.length > 0 && (
                <>
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {person.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="contact" className="m-0 p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  Contact Information
                </h3>
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-teal-500" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium">Email</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-all">{email}</p>
                      </div>
                    </div>
                    
                    {person.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-teal-500" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium">Phone</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{person.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {location.name && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-teal-500" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium">Location</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{location.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {person.linkedin_url && (
                      <div className="flex items-center gap-3">
                        <Linkedin className="h-5 w-5 text-teal-500" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium">LinkedIn</p>
                          <a 
                            href={person.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-teal-600 hover:underline flex items-center gap-1"
                          >
                            {person.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="education" className="m-0 p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  Education
                </h3>
                
                {person.education && person.education.length > 0 ? (
                  <div className="space-y-3">
                    {person.education.map((edu: any, index: number) => (
                      <Card key={index} className="border">
                        <CardHeader className="p-3 pb-2">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-muted flex items-center justify-center rounded">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-sm sm:text-base">{edu.school?.name || 'University'}</CardTitle>
                              <CardDescription className="text-xs sm:text-sm">
                                {edu.degree || 'Degree'}{edu.field_of_study ? `, ${edu.field_of_study}` : ''}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {edu.start_date && (
                              <div>
                                {edu.start_date} - {edu.end_date || 'Present'}
                                {edu.is_current && ' (Current)'}
                              </div>
                            )}
                            {edu.gpa && <div className="mt-1">GPA: {edu.gpa}</div>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground text-sm">No education information available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>

          <div className="flex justify-end items-center gap-2 p-3 border-t">
            <Button variant="outline" onClick={onClose} size="sm">Close</Button>
            {person.linkedin_url && (
              <Button size="sm" asChild>
                <a 
                  href={person.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  View LinkedIn
                </a>
              </Button>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 