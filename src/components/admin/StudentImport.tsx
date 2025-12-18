import { useState, useRef, forwardRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { useParrainageStore } from '@/store/useParrainageStore';
import { Promotion } from '@/types/student';
import { useToast } from '@/hooks/use-toast';

interface CSVRow {
  nom: string;
  prenom: string;
  matricule?: string;
  promotion: string;
}

export const StudentImport = forwardRef<HTMLDivElement>((_, ref) => {
  const { addStudents, students, clearStudents } = useParrainageStore();
  const [isDragging, setIsDragging] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validPromotions: Promotion[] = ['B1', 'B2', 'B3', 'M1', 'M2'];

  const processCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.toLowerCase().trim(),
      complete: (results) => {
        const errors: string[] = [];
        const validStudents: { nom: string; prenom: string; matricule?: string; promotion: Promotion }[] = [];

        (results.data as CSVRow[]).forEach((row, index) => {
          const lineNum = index + 2; // +2 pour header et index 0

          if (!row.nom || !row.prenom) {
            errors.push(`Ligne ${lineNum}: Nom ou prénom manquant`);
            return;
          }

          const promotion = row.promotion?.toUpperCase() as Promotion;
          if (!validPromotions.includes(promotion)) {
            errors.push(`Ligne ${lineNum}: Promotion invalide "${row.promotion}"`);
            return;
          }

          validStudents.push({
            nom: row.nom.trim(),
            prenom: row.prenom.trim(),
            matricule: row.matricule?.trim() || undefined,
            promotion,
          });
        });

        if (validStudents.length > 0) {
          addStudents(validStudents);
          toast({
            title: "Import réussi",
            description: `${validStudents.length} étudiant(s) importé(s)`,
          });
        }

        setImportResult({ success: validStudents.length, errors });
      },
      error: (error) => {
        toast({
          title: "Erreur d'import",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      processCSV(file);
    } else {
      toast({
        title: "Format invalide",
        description: "Veuillez importer un fichier CSV",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCSV(file);
    }
  };

  const handleClearAll = () => {
    clearStudents();
    setImportResult(null);
    toast({
      title: "Liste vidée",
      description: "Tous les étudiants ont été supprimés",
    });
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/30'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-lg font-medium mb-2">
          {isDragging ? "Déposez le fichier ici" : "Importer un fichier CSV"}
        </p>
        <p className="text-sm text-muted-foreground">
          Colonnes requises : nom, prenom, promotion (B1, B2, B3, M1, M2)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Colonne optionnelle : matricule
        </p>
      </div>

      {/* Import results */}
      {importResult && (
        <div className="card-gradient border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            <span>{importResult.success} étudiant(s) importé(s)</span>
          </div>
          
          {importResult.errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="w-5 h-5" />
                <span>{importResult.errors.length} erreur(s)</span>
              </div>
              <div className="max-h-32 overflow-y-auto text-sm text-muted-foreground pl-7">
                {importResult.errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {validPromotions.map((promo) => {
          const count = students.filter((s) => s.promotion === promo).length;
          return (
            <div key={promo} className="card-gradient border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gradient">{count}</div>
              <div className="text-sm text-muted-foreground">{promo}</div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {students.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <p className="text-muted-foreground">
            Total : <span className="text-foreground font-semibold">{students.length}</span> étudiants
          </p>
          <Button variant="danger" onClick={handleClearAll}>
            Vider la liste
          </Button>
        </div>
      )}

      {/* Format example */}
      <div className="card-gradient border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-medium">Exemple de format CSV</span>
        </div>
        <pre className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg overflow-x-auto">
{`nom,prenom,matricule,promotion
Dupont,Jean,2024001,B1
Martin,Marie,2024002,B2
Durand,Pierre,,M1`}
        </pre>
      </div>
    </div>
  );
});

StudentImport.displayName = 'StudentImport';
