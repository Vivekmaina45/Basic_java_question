public class Armstrong {

  public static void main(String[] args) {
    int n = 2;
    int num = n;
    int sum = 0;
    while (n > 0) {
      int arm = n % 10;
      // System.out.println(arm);
      sum = sum + arm * arm * arm;
      // System.out.println(sum);
      n = n / 10;
      // System.out.println(n);
      // System.out.println(" ");
      // System.out.println(sum);

    }
    if (num == sum) {
      System.out.println("It is armstrong no.");
    } else {
      System.out.println("NO");
      // System.out.println(sum);
    }
  }
}