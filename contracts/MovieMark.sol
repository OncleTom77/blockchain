pragma solidity ^0.4.0;

contract MovieMark {

   struct Opinion {
       address author;
       string movieTitle;
       int mark;
   }

   Opinion[] public opinions;

   function hasVoted(address author, string movieTitle) public constant returns (bool) {
       for(uint i = 0; i < opinions.length; i++){
           if(keccak256(opinions[i].movieTitle) == keccak256(movieTitle)){
               if(opinions[i].author == author)
                   return true;
           }
       }
       return false;
   }

   function getOpinionCount() public constant returns(uint entityCount) {
       return opinions.length;
   }

   function getOpinionMovieTitle(uint index) public constant returns(string){
       return opinions[index].movieTitle;
   }

   function sendNewOpinion(string movieTitle, int mark) public returns (uint) {
       require(mark >= 0);
       require(mark <= 5);

       require(!hasVoted(msg.sender, movieTitle));

       Opinion memory opinion = Opinion(msg.sender, movieTitle, mark);
       return opinions.push(opinion);
   }

   function getMovieMark(string movieTitle) public constant returns (int) {
       int sum = 0;
       int numberMark = 0;
       for(uint i = 0; i < opinions.length; i++){
           if(keccak256(opinions[i].movieTitle) == keccak256(movieTitle)){
               sum += opinions[i].mark;
               numberMark++;
           }
       }
       if (numberMark > 0)
           return sum/numberMark;
       else
           return -1;
   }
}