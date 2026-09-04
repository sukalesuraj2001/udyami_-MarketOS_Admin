interface UserProfileData {
  profileId: string | null;
  userId: string | null;
  alternateMobile: string | null;
  gender: string | null;
  state: string | null;
  district: string | null;
  assembly: string | null;
  ward: string | null;
  pincode: string | null;
  homeAddress: string | null;
  officeAddress: string | null;
  hasBusiness: boolean;
  businessDetails: any;
  createdAt: string | null;
  updatedAt: string | null;
  profileImage: string | null;
  selectedBusinessVertical: string | null;
  familyInformation: string | null;
  spouse: string | null;
  children: string | null;
  pets: string | null;
  hobbies: string | null;
  activitiesOrInterests: string | null;
  cityOfResidence: string | null;
  yearsInCity: number | null;
}

interface UserAiTokenUsage {
  userId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalRequests: number;
  profile: UserProfileData | null;
}