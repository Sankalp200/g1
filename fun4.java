import java .util.Scanner;
class fun4
{
    public static int multi(int a,int b)
    {
        
        return a*b;
    }
    public static void main(String args[])
    {
        Scanner sc=new Scanner(System.in);
        int a=sc.nextInt();
        int b=sc.nextInt();
        int m=multi(a,b);
        System.out.println("mutliply="+ multi(a,b));
        sc.close();

    }
}
