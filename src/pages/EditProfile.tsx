import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { EditProfileForm } from '@/components/EditProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const EditProfile = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Edit Profile - 11x LOVE LaB',
    description: 'Update your profile information',
  });

  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Login Required</CardTitle>
                </div>
                <CardDescription>
                  Please log in to edit your profile.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back to Profile Button */}
          <Link to="/profile" className="inline-block mb-6">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your public profile information. Changes will be published to Nostr.
            </p>
          </div>

          {/* Edit Profile Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your profile is stored on Nostr and synced across all clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditProfileForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;
