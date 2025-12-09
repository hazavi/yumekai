import { Metadata } from 'next';
import { UserProfilePage } from './UserProfilePage';

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);
  
  return {
    title: `${username}'s Profile - YumeKai`,
    description: `View ${username}'s anime lists and top 10 rankings on YumeKai`,
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);
  
  return <UserProfilePage username={username} />;
}
