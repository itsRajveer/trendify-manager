
import { useStock } from "@/contexts/StockContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const Transactions = () => {
  const { transactions } = useStock();

  // Group transactions by date for easier display
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, typeof transactions>);

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Clock className="h-5 w-5 mr-2" />
        Transaction History
      </h1>

      {transactions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-medium">No transactions yet</h3>
              <p className="text-muted-foreground">
                Your transaction history will appear here once you start trading.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              Your complete buying and selling history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedDates.map((date) => (
              <div key={date} className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-2">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </h2>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedTransactions[date]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <Badge variant={transaction.type === 'buy' ? 'default' : 'secondary'}>
                                {transaction.type === 'buy' ? (
                                  <span className="flex items-center">
                                    <ArrowDownToLine className="h-3 w-3 mr-1" />
                                    Buy
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <ArrowUpFromLine className="h-3 w-3 mr-1" />
                                    Sell
                                  </span>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{transaction.symbol}</TableCell>
                            <TableCell>{transaction.shares}</TableCell>
                            <TableCell>${transaction.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${transaction.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Transactions;
