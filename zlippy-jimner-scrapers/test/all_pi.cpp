#include<iostream>
int main()
{
	int i,q=22,d=7,rem,div;

	while(true)
	{
		div=q/d;
		std::cout<<div;
		rem=q%d;
		q=rem*10;
		for(int j=1;j<1000000;j++);
	}
	return 0;
}
