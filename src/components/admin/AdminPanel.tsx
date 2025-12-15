import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Users, History, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentImport } from './StudentImport';
import { StudentList } from './StudentList';
import { PairingHistory } from './PairingHistory';
import { useParrainageStore } from '@/store/useParrainageStore';

type TabId = 'import' | 'students' | 'history';

interface AdminPanelProps {
  onStartCeremony: () => void;
}

export const AdminPanel = ({ onStartCeremony }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('import');
  const { students } = useParrainageStore();

  const tabs: { id: TabId; label: string; icon: typeof Upload }[] = [
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'students', label: 'Étudiants', icon: Users },
    { id: 'history', label: 'Historique', icon: History },
  ];

  const filleulsDisponibles = students.filter(
    (s) => s.status === 'disponible' && ['B1', 'B2', 'B3', 'M1'].includes(s.promotion)
  ).length;

  return (
    <div className="min-h-screen hero-gradient">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold font-display text-gradient mb-2">
              Administration
            </h1>
            <p className="text-muted-foreground">
              Gérez les étudiants et lancez la cérémonie de parrainage
            </p>
          </div>
          
          <Button
            variant="ceremony"
            size="lg"
            onClick={onStartCeremony}
            disabled={filleulsDisponibles === 0}
          >
            <Play className="w-5 h-5 mr-2" />
            Lancer la cérémonie
          </Button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'import' && <StudentImport />}
          {activeTab === 'students' && <StudentList />}
          {activeTab === 'history' && <PairingHistory />}
        </motion.div>
      </div>
    </div>
  );
};
