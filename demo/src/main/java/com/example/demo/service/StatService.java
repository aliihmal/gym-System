package  com.example.demo.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Stat;
import com.example.demo.repository.StatRepository;

@Service
public class StatService{
    private StatRepository statrepo;

    public StatService(StatRepository statrepo) {
        this.statrepo = statrepo;
    }
    
    public Stat createStat(){
        LocalDate nowdate = LocalDate.now();
        int nextMonth = nowdate.getMonthValue()+1;
        Stat statobj = new Stat();
        statobj.setEndTime(nextMonth);
        statobj.setStartTime(nowdate);
        statobj.setNumberOfRenewl(0);
        statobj.setNumberOfNewClient(0);
        statobj.setRevenu(0);
        return this.statrepo.save(statobj);
         
    }
    public Stat updateNewClientNb(){
        List<Stat> stats = this.statrepo.findAll();
        Stat stat = stats.get(0);
        int thismonth= stat.getStartTime().getMonthValue();
        if(thismonth==stat.getEndTime()){
            stat.setNumberOfNewClient(1);
        }else{
            stat.setNumberOfNewClient(stat.getNumberOfNewClient()+1);
        }
        return this.statrepo.save(stat); 
    }
    
    public Stat updateStat(int monthNb){
        List<Stat> stats = this.statrepo.findAll();
        Stat stat = stats.get(0);
        int thismonth= stat.getStartTime().getMonthValue();
        if(thismonth==stat.getEndTime()){
            stat.setRevenu(40*monthNb);
            stat.setNumberOfRenewl(1);
            stat.setStartTime(LocalDate.now());
            stat.setEndTime(LocalDate.now().getMonthValue()+1);
        }else{
            stat.setRevenu(stat.getRevenu()+(40*monthNb));
            stat.setNumberOfRenewl(stat.getNumberOfRenewl()+1);
        }
        return  this.statrepo.save(stat);
    }
    
    public Stat getThestat(){
        List<Stat> stats = this.statrepo.findAll();
        Stat stat = stats.get(0);
        return stat;
    }
}