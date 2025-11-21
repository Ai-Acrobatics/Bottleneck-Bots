import { Route, Switch } from 'wouter';
import DashboardHome from '@/pages/DashboardHome';
import ScheduledTasksPage from '@/pages/ScheduledTasks';
import { Settings } from '@/pages/Settings';
import WorkflowBuilder from '@/pages/WorkflowBuilder';
import BrowserSessions from '@/pages/BrowserSessions';
import Quizzes from '@/pages/Quizzes';
import QuizBuilder from '@/pages/QuizBuilder';
import QuizTake from '@/pages/QuizTake';
import QuizResults from '@/pages/QuizResults';
import MyAttempts from '@/pages/MyAttempts';
import LeadLists from '@/pages/LeadLists';
import LeadUpload from '@/pages/LeadUpload';
import LeadDetails from '@/pages/LeadDetails';
import AICampaigns from '@/pages/AICampaigns';
import CampaignDetails from '@/pages/CampaignDetails';
import CreditPurchase from '@/pages/CreditPurchase';
import DashboardLayout from './DashboardLayout';
import { Toaster } from '@/components/ui/sonner';

export function Routes() {
  return (
    <>
      <DashboardLayout>
        <Switch>
          <Route path="/" component={DashboardHome} />
          <Route path="/scheduled-tasks" component={ScheduledTasksPage} />
          <Route path="/workflow-builder" component={WorkflowBuilder} />
          <Route path="/browser-sessions" component={BrowserSessions} />
          <Route path="/settings" component={Settings} />
          <Route path="/quizzes" component={Quizzes} />
          <Route path="/quizzes/create" component={QuizBuilder} />
          <Route path="/quizzes/:id/edit" component={QuizBuilder} />
          <Route path="/quizzes/:id/take" component={QuizTake} />
          <Route path="/quizzes/:id/results/:attemptId" component={QuizResults} />
          <Route path="/quizzes/my-attempts" component={MyAttempts} />
          <Route path="/lead-lists" component={LeadLists} />
          <Route path="/lead-lists/upload" component={LeadUpload} />
          <Route path="/lead-lists/:id" component={LeadDetails} />
          <Route path="/ai-campaigns" component={AICampaigns} />
          <Route path="/ai-campaigns/:id" component={CampaignDetails} />
          <Route path="/credits" component={CreditPurchase} />
          <Route path="/team">
            {() => (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold">Team</h1>
                <p className="text-muted-foreground">Team management coming soon...</p>
              </div>
            )}
          </Route>
          <Route>
            {() => (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold">404</h1>
                <p className="text-muted-foreground">Page not found</p>
              </div>
            )}
          </Route>
        </Switch>
      </DashboardLayout>
      <Toaster />
    </>
  );
}
