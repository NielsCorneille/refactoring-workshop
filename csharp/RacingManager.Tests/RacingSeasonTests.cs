namespace RacingManager.Tests
{
    public class RacingSeasonTests
    {
        private RacingSeason _racingSeason;
        private Guid _racer1Id;
        private Guid _racer2Id;
        private Guid _racer3Id;
        private Guid _race1Id;
        private Guid _race2Id;

        public RacingSeasonTests()
        {
            _racingSeason = new RacingSeason();
            _racer1Id = _racingSeason.AddRacer("Driver A", false);
            _racer2Id = _racingSeason.AddRacer("Driver B", false);
            _racer3Id = _racingSeason.AddRacer("Driver C", true);
            _race1Id = _racingSeason.AddRace("Monaco");
            _race2Id = _racingSeason.AddRace("Spa");
            _racingSeason.AddResult(_race1Id, _racer1Id, 3);
            _racingSeason.AddResult(_race2Id, _racer1Id, 3);
            _racingSeason.AddResult(_race1Id, _racer2Id, 1);
            _racingSeason.AddResult(_race2Id, _racer2Id, 2);
            _racingSeason.AddResult(_race1Id, _racer3Id, 4);
            _racingSeason.AddResult(_race2Id, _racer3Id, 4);
        }

        [Fact]
        public void GetRacerPositions_ShouldReturnEnteredPositions()
        {
            var results = _racingSeason.GetRacerPositions(_racer2Id);
            Assert.Equal(1, results.Single(r => r.raceName == "Monaco").position);
            Assert.Equal(2, results.Single(r => r.raceName == "Spa").position);
        }

        [Fact]
        public void GetResults_ShouldReturnSummedPoints()
        {
            var results = _racingSeason.GetResults();
            Assert.Equal(43, results[(_racer2Id, "Driver B")]);
        }

        [Fact]
        public void GetResults_ShouldSortByPointsDescending()
        {
            var results = _racingSeason.GetResults();
            Assert.Equal(_racer2Id, results.ToList()[0].Key.racerId);
            Assert.Equal(43, results.ToList()[0].Value);
            Assert.Equal(_racer1Id, results.ToList()[1].Key.racerId);
            Assert.Equal(30, results.ToList()[1].Value);
        }

        [Fact]
        public void GetResults_ShouldIdentifyAIDrivers()
        {
            var results = _racingSeason.GetResults();
            Assert.Equal(_racer3Id, results.ToList()[2].Key.racerId);
            Assert.Equal("Driver C [AI]", results.ToList()[2].Key.racerName);
        }
    }
}
