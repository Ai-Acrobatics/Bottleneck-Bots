import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Check } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  discount?: number;
  features?: string[];
}

interface CreditPackageCardProps {
  package: CreditPackage;
  onPurchase: () => void;
  isLoading?: boolean;
  recommended?: boolean;
}

export function CreditPackageCard({
  package: pkg,
  onPurchase,
  isLoading = false,
  recommended = false
}: CreditPackageCardProps) {
  const pricePerCredit = pkg.price / pkg.credits;

  return (
    <Card className={recommended ? 'border-primary shadow-lg' : ''}>
      {recommended && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
          Recommended
        </div>
      )}
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Coins className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold">{pkg.name}</h3>
          {pkg.discount && (
            <Badge variant="secondary" className="mt-2">
              Save {pkg.discount}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">${pkg.price}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {pkg.credits.toLocaleString()} credits
          </p>
          <p className="text-xs text-muted-foreground">
            ${pricePerCredit.toFixed(3)} per credit
          </p>
        </div>

        {pkg.features && pkg.features.length > 0 && (
          <div className="space-y-2">
            {pkg.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={onPurchase}
          className="w-full"
          size="lg"
          disabled={isLoading}
          variant={recommended ? 'default' : 'outline'}
        >
          {isLoading ? 'Processing...' : 'Purchase'}
        </Button>
      </CardContent>
    </Card>
  );
}
